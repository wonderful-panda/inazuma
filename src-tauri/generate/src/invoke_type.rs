use std::collections::HashMap;
use std::error::Error;
use std::fs;
use std::io::Read;
use std::path::Path;
use syn::visit::Visit;

#[derive(Debug)]
pub enum TsType {
    Ignored(String),
    Invalid(String),
    Void,
    String,
    Number,
    Boolean,
    Optional(Box<TsType>),
    Array(Box<TsType>),
    Tuple(Box<Vec<TsType>>),
    Record {
        key: Box<TsType>,
        value: Box<TsType>,
    },
    UserDefined(String),
}

impl TsType {
    pub fn is_ignored(&self) -> bool {
        if let TsType::Ignored(..) = self {
            true
        } else {
            false
        }
    }
    pub fn is_optional(&self) -> bool {
        if let TsType::Optional(..) = self {
            true
        } else {
            false
        }
    }
}

#[derive(Debug)]
pub struct TsArg {
    pub name: String,
    pub ty: TsType,
}

#[derive(Debug)]
pub struct TsFunc {
    pub name: String,
    pub args: Vec<TsArg>,
    pub ret: TsType,
}

fn is_tauricommand_attribute(attr: &syn::Attribute) -> bool {
    let segs: Vec<&syn::PathSegment> = attr.path.segments.pairs().map(|p| *p.value()).collect();
    if let (Some(seg1), Some(seg2)) = (segs.get(0), segs.get(1)) {
        seg1.ident.to_string().eq("tauri") && seg2.ident.to_string().eq("command")
    } else {
        false
    }
}

fn has_tauricommand_attribute<'a>(node: &'a syn::ItemFn) -> bool {
    node.attrs.iter().any(is_tauricommand_attribute)
}

fn get_type_args<'ast>(args: &'ast syn::PathArguments) -> Vec<&'ast syn::Type> {
    match args {
        syn::PathArguments::AngleBracketed(args) => args
            .args
            .iter()
            .flat_map(|a| {
                if let syn::GenericArgument::Type(t) = a {
                    Some(t)
                } else {
                    None
                }
            })
            .collect(),
        _ => Vec::new(),
    }
}

fn build_ts_type(ty: &syn::Type) -> TsType {
    match ty {
        syn::Type::Tuple(tuple) => {
            let ty_vec: Vec<TsType> = tuple
                .elems
                .pairs()
                .map(|p| build_ts_type(p.value()))
                .collect();
            if ty_vec.len() == 0 {
                TsType::Void
            } else {
                TsType::Tuple(Box::new(ty_vec))
            }
        }
        syn::Type::Path(type_path) => {
            let seg = type_path.path.segments.last().unwrap();
            let type_name = seg.ident.to_string();
            match type_name.as_str() {
                "State" | "Window" | "AppHandle" => TsType::Ignored(type_name),
                "String" | "str" | "Path" => TsType::String,
                "usize" | "u16" | "u32" | "u64" | "isize" | "i16" | "i32" | "i64" => TsType::Number,
                "bool" => TsType::Boolean,
                "Result" => {
                    let types = get_type_args(&seg.arguments);
                    if let Some(ty) = types.get(0) {
                        build_ts_type(*ty)
                    } else {
                        TsType::Invalid(String::from("Result"))
                    }
                }
                "Option" => {
                    let types = get_type_args(&seg.arguments);
                    if let Some(ty) = types.get(0) {
                        let inner = build_ts_type(*ty);
                        if let TsType::Optional(..) = inner {
                            inner
                        } else {
                            TsType::Optional(Box::new(inner))
                        }
                    } else {
                        TsType::Invalid(String::from("Option"))
                    }
                }
                "Vec" => {
                    let types = get_type_args(&seg.arguments);
                    if let Some(ty) = types.get(0) {
                        TsType::Array(Box::new(build_ts_type(*ty)))
                    } else {
                        TsType::Invalid(String::from("Vec"))
                    }
                }
                "HashMap" => {
                    let types = get_type_args(&seg.arguments);
                    if let (Some(key), Some(value)) = (types.get(0), types.get(1)) {
                        TsType::Record {
                            key: Box::new(build_ts_type(key)),
                            value: Box::new(build_ts_type(value)),
                        }
                    } else {
                        TsType::Invalid(String::from("HashMap"))
                    }
                }
                _ => TsType::UserDefined(type_name.clone()),
            }
        }
        syn::Type::Reference(ty) => build_ts_type(&ty.elem),
        syn::Type::Paren(ty) => build_ts_type(&ty.elem),
        _ => TsType::Invalid(String::from("unsupported-node")),
    }
}

struct FnVisitor {
    funcs: HashMap<String, TsFunc>,
}

impl<'ast> syn::visit::Visit<'ast> for FnVisitor {
    fn visit_item_fn(&mut self, node: &'ast syn::ItemFn) {
        if !has_tauricommand_attribute(node) {
            return;
        }
        let name = node.sig.ident.to_string();
        let args = node
            .sig
            .inputs
            .iter()
            .filter_map(|ty| {
                if let syn::FnArg::Typed(ty) = ty {
                    if let syn::Pat::Ident(ref pat_ident) = *ty.pat {
                        let ts_type = build_ts_type(&ty.ty);
                        if ts_type.is_ignored() {
                            None
                        } else {
                            Some(TsArg {
                                name: pat_ident.ident.to_string(),
                                ty: ts_type,
                            })
                        }
                    } else {
                        None
                    }
                } else {
                    None
                }
            })
            .collect::<Vec<_>>();

        let ret = if let syn::ReturnType::Type(_, ty) = &node.sig.output {
            let ret = build_ts_type(ty);
            if ret.is_ignored() {
                TsType::Void
            } else {
                ret
            }
        } else {
            TsType::Void
        };

        let key = name.clone();
        self.funcs.entry(key).or_insert(TsFunc { name, args, ret });
    }
}

pub fn gather_tauri_commands(
    source_path: &Path,
) -> Result<HashMap<String, TsFunc>, Box<dyn Error>> {
    let mut file = fs::File::open(source_path)?;
    let mut content = String::new();
    file.read_to_string(&mut content)?;
    let ast: syn::File = syn::parse_file(&content)?;
    let mut visitor = FnVisitor {
        funcs: HashMap::new(),
    };
    visitor.visit_file(&ast);
    Ok(visitor.funcs)
}
