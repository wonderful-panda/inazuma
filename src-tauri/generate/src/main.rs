use clap::{Parser, Subcommand};
use glob::glob;
use handlebars::Handlebars;
use invoke_type::{gather_tauri_commands, TsFunc};
use schemars::schema_for;
use serde::{Deserialize, Serialize};
use std::{collections::HashMap, error::Error, fs::write, path::PathBuf};
use translate_func::{translate_func, TranslatedFunc};

mod invoke_type;
mod translate_func;

#[derive(Parser, Debug)]
#[clap(name = "generate", author, about, version)]
struct Args {
    #[clap(subcommand)]
    command: Commands,
}

#[derive(Debug, Subcommand)]
enum Commands {
    /// Generate JSON schema of types
    Schema {
        /// Output file path. Print to stdout if not specified
        #[clap(long)]
        out: Option<PathBuf>,
    },
    /// Extract method name, argument types, and return type of rust commands
    Invoke {
        /// path or glob pattern of source file
        #[clap(long)]
        src: String,
        /// Template file path. Print to stdout if not specified
        #[clap(long)]
        template: PathBuf,
        /// Output file path. Print to stdout if not specified
        #[clap(long)]
        out: Option<PathBuf>,
    },
}

fn generate_schema(out: Option<&PathBuf>) -> Result<(), Box<dyn Error>> {
    let schema = schema_for!(types::Root);
    let json = serde_json::to_string_pretty(&schema)?;
    if let Some(path) = out {
        write(path, json)?;
    } else {
        println!("{}", &json);
    }
    Ok(())
}

#[derive(Serialize, Deserialize)]
struct TemplateData {
    funcs: Vec<TranslatedFunc>,
}

fn generate_invoke(
    src: &str,
    template: &PathBuf,
    out: Option<&PathBuf>,
) -> Result<(), Box<dyn Error>> {
    let paths = glob(src)?;
    let files = paths.flat_map(|f| f.ok()).collect::<Vec<_>>();

    let mut funcs: HashMap<String, TsFunc> = HashMap::new();
    for f in files.iter() {
        let mut new_funcs = gather_tauri_commands(f)?;
        funcs.extend(new_funcs.drain());
    }

    let mut translated_funcs: Vec<TranslatedFunc> = funcs.values().map(translate_func).collect();
    translated_funcs.sort_by(|a, b| a.name.cmp(&b.name));

    let mut handlebars = Handlebars::new();
    handlebars.register_template_file("template", template)?;
    let source = handlebars.render(
        "template",
        &TemplateData {
            funcs: translated_funcs,
        },
    )?;
    if let Some(path) = out {
        write(path, source)?;
    } else {
        println!("{}", source);
    }
    Ok(())
}

fn main() {
    let args = Args::parse();
    match args.command {
        Commands::Schema { out } => {
            generate_schema(out.as_ref()).expect("Failed to generate json schema");
        }
        Commands::Invoke { src, template, out } => {
            generate_invoke(&src, &template, out.as_ref()).expect("Failed to generate invoke type");
        }
    }
}
