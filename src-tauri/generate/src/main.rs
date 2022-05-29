use clap::Parser;
use glob::glob;
use invoke_type::{gather_tauri_commands, TsFunc};
use std::{collections::HashMap, error::Error, fs::write, path::PathBuf};

mod invoke_type;

/// Extract method name, argument types, and return type of rust commands
#[derive(Parser, Debug)]
#[clap(name = "generate", author, about, version)]
struct Args {
    /// path or glob pattern of source file
    #[clap(long)]
    src: String,
    /// Output file path. Print to stdout if not specified
    #[clap(long)]
    out: Option<PathBuf>,
}

fn generate_invoke(src: &str, out: Option<&PathBuf>) -> Result<(), Box<dyn Error>> {
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
    Ok(())
}

fn main() {
    let Args { src, out } = Args::parse();
    generate_invoke(&src, out.as_ref()).expect("Failed to generate invoke type");
}
