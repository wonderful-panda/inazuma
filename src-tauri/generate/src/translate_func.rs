use super::invoke_type::{TsArg, TsFunc, TsType};
use regex::{Captures, Regex};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct TranslatedFunc {
    pub name: String,
    pub payload: String,
    pub ret: String,
}

fn translate_type(ty: &TsType) -> String {
    match ty {
        TsType::String => "string".to_owned(),
        TsType::Number => "number".to_owned(),
        TsType::Boolean => "boolean".to_owned(),
        TsType::Void => "void".to_owned(),
        TsType::Optional(inner) => {
            format!("({}) | undefined", translate_type(inner))
        }
        TsType::Array(inner) => {
            format!("Array<{}>", translate_type(inner))
        }
        TsType::Tuple(inner) => {
            let expressions: Vec<String> = inner.iter().map(translate_type).collect();
            format!("[{}]", expressions.join(", "))
        }
        TsType::Record { key, value } => {
            format!("Record<{}, {}>", translate_type(key), translate_type(value))
        }
        TsType::UserDefined(inner) => {
            format!("backend.{}", inner)
        }
        TsType::Ignored(inner) => {
            format!("Ignored<\"{}\">", inner)
        }
        TsType::Invalid(inner) => {
            format!("Invalid<\"{}\">", inner)
        }
    }
}

fn to_camelcase(text: &str) -> String {
    let re = Regex::new("_([a-z])").unwrap();
    re.replace_all(text, |caps: &Captures| caps[1].to_uppercase())
        .to_string()
}

fn translate_arg(arg: &TsArg) -> String {
    let name = to_camelcase(&arg.name);
    let ty = translate_type(&arg.ty);
    if arg.ty.is_optional() {
        format!("{}?: {}", name, ty)
    } else {
        format!("{}: {}", name, ty)
    }
}

fn translate_args(args: &Vec<TsArg>) -> String {
    let arg_list = args
        .iter()
        .filter_map(|a| {
            if let TsType::Ignored(..) = a.ty {
                None
            } else {
                Some(translate_arg(a))
            }
        })
        .collect::<Vec<_>>();
    if arg_list.is_empty() {
        "".to_owned()
    } else {
        format!("{{ {} }}", arg_list.join(", "))
    }
}

/**
 * Translate TsFunc object to TypeScript expressions
 */
pub fn translate_func(func: &TsFunc) -> TranslatedFunc {
    TranslatedFunc {
        name: func.name.to_owned(),
        payload: translate_args(&func.args),
        ret: translate_type(&func.ret),
    }
}
