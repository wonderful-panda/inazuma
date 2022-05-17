use clap::{Parser, Subcommand};
use glob::glob;
use invoke_type::{gather_tauri_commands, TsFunc};
use schemars::schema_for;
use std::{collections::HashMap, error::Error, fs::write, path::PathBuf};

mod invoke_type;

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
        /// Output file path. Print to stdout if not specified
        #[clap(long)]
        out: Option<PathBuf>,
        /// Output file path of schema.
        #[clap(long)]
        schema: Option<PathBuf>,
    },
}

fn generate_schema(path: Option<&PathBuf>) -> Result<(), Box<dyn Error>> {
    let schema = schema_for!(types::Root);
    let json = serde_json::to_string_pretty(&schema)?;
    if let Some(path) = path {
        write(path, json)?;
    } else {
        println!("{}", &json);
    }
    Ok(())
}

fn generate_invoke(
    src: &str,
    out: Option<&PathBuf>,
    schema: Option<&PathBuf>,
) -> Result<(), Box<dyn Error>> {
    let paths = glob(src)?;
    let files = paths.flat_map(|f| f.ok()).collect::<Vec<_>>();

    let mut funcs: HashMap<String, TsFunc> = HashMap::new();
    for f in files.iter() {
        let mut new_funcs = gather_tauri_commands(f)?;
        funcs.extend(new_funcs.drain().map(|(name, func)| (name, func)));
    }

    let json = serde_json::to_string_pretty(&funcs.into_values().collect::<Vec<_>>())?;
    if let Some(path) = out {
        write(path, json)?;
    } else {
        println!("{}", &json);
    }
    if let Some(path) = schema {
        let schema = schema_for!(TsFunc);
        let json = serde_json::to_string_pretty(&schema)?;
        write(path, json)?;
    }
    Ok(())
}

fn main() {
    let args = Args::parse();
    match args.command {
        Commands::Schema { out } => {
            generate_schema(out.as_ref()).expect("Failed to generate json schema");
        }
        Commands::Invoke { src, out, schema } => {
            generate_invoke(&src, out.as_ref(), schema.as_ref())
                .expect("Failed to generate invoke type");
        }
    }
}
