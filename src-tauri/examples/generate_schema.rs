use std::{env, fs::write};

use app::types;
use schemars::schema_for;

fn main() {
    let args: Vec<String> = env::args().collect();
    let schema = schema_for!(types::Root);
    let json = serde_json::to_string_pretty(&schema).expect("Failed to generate json schema");
    if args.len() < 2 {
        println!("{}", &json);
    } else {
        write(&args[1], json).expect("Failed to write json schema to file");
    }
}
