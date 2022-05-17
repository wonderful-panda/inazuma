use super::{exec, merge_heads, rev_parse, GitError};
use std::path::Path;
use types::*;

fn parse_refs_output(output: &str) -> Result<Refs, GitError> {
    let mut refs = Refs {
        head: None,
        merge_heads: Vec::new(),
        refs: Vec::new(),
    };
    for line in output.lines() {
        let tokens: Vec<&str> = line.split('\0').collect();
        match tokens.as_slice() {
            [sha, head, deref, object_type, fullname] => {
                let refname_components: Vec<&str> = fullname.split('/').collect();
                if refname_components[0] != "refs" {
                    continue;
                }
                match refname_components[1] {
                    "heads" => {
                        let branch = Ref::Branch {
                            fullname: fullname.to_string(),
                            id: sha.to_string(),
                            name: refname_components[2..].join("/").to_string(),
                            current: *head == "*",
                        };
                        refs.refs.push(branch);
                        if *head == "*" {
                            refs.head = Some(sha.to_string());
                        }
                    }
                    "tags" => {
                        refs.refs.push(Ref::Tag {
                            fullname: fullname.to_string(),
                            id: (if *object_type == "tag" { deref } else { sha }).to_string(),
                            tag_sha: sha.to_string(),
                            name: refname_components[2..].join("/").to_string(),
                        });
                    }
                    "remotes" => {
                        let remote = refname_components[2];
                        refs.refs.push(Ref::Remote {
                            fullname: fullname.to_string(),
                            id: sha.to_string(),
                            remote: remote.to_string(),
                            name: refname_components[3..].join("/").to_string(),
                        });
                    }
                    _ => {
                        // do nothing
                    }
                }
            }
            _ => {
                return Err(GitError::UnexpectedOutput {
                    command: String::from("for-each-ref"),
                    text: line.to_string(),
                })
            }
        }
    }
    Ok(refs)
}

pub async fn get_refs(repo_path: &Path) -> Result<Refs, GitError> {
    let repo_path = Path::new(repo_path);
    let args = vec![
        "--sort",
        "-creatordate",
        "--format",
        "%(objectname)%00%(HEAD)%00%(*objectname)%00%(objecttype)%00%(refname)",
    ];
    let output = exec(repo_path, "for-each-ref", &args, &[]).await?;
    GitError::assert_process_output("for-each-ref", &output)?;
    let stdout = std::str::from_utf8(&output.stdout).unwrap();
    let mut refs = parse_refs_output(stdout)?;
    if refs.head.is_none() {
        refs.head = rev_parse::rev_parse(repo_path, "HEAD").await?;
    }
    refs.merge_heads = merge_heads::get_merge_heads(repo_path).await?;
    Ok(refs)
}
