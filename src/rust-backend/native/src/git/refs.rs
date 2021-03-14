use super::types::*;
use super::{exec, merge_heads, rev_parse, GitError};
use std::collections::HashMap;
use std::path::Path;

fn parse_refs_output(output: &str) -> Result<Refs, GitError> {
    let mut refs = Refs {
        head: None,
        merge_heads: Vec::new(),
        branches: Vec::new(),
        tags: Vec::new(),
        remotes: HashMap::new(),
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
                        let branch = BranchRef {
                            fullname: fullname.to_string(),
                            sha: sha.to_string(),
                            name: refname_components[2..].join("/").to_string(),
                            current: *head == "*",
                        };
                        if branch.current {
                            refs.head = Some(sha.to_string());
                        }
                        refs.branches.push(branch);
                    }
                    "tags" => {
                        refs.tags.push(TagRef {
                            fullname: fullname.to_string(),
                            sha: (if *object_type == "tag" { deref } else { sha }).to_string(),
                            tag_sha: sha.to_string(),
                            name: refname_components[2..].join("/").to_string(),
                        });
                    }
                    "remotes" => {
                        let remote = refname_components[2];
                        let remote_ref = RemoteRef {
                            fullname: fullname.to_string(),
                            sha: sha.to_string(),
                            remote: remote.to_string(),
                            name: refname_components[3..].join("/").to_string(),
                        };
                        refs.remotes
                            .entry(remote.to_string())
                            .or_insert_with(|| Vec::new())
                            .push(remote_ref);
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

pub fn refs(repo_path: &Path) -> Result<Refs, GitError> {
    let repo_path = Path::new(repo_path);
    let args = vec![
        "--sort",
        "-creatordate",
        "--format",
        "%(objectname)%00%(HEAD)%00%(*objectname)%00%(objecttype)%00%(refname)",
    ];
    let output = exec(repo_path, "for-each-ref", &args, &[])?;
    GitError::assert_process_output("for-each-ref", &output)?;
    let stdout = std::str::from_utf8(&output.stdout).unwrap();
    let mut refs = parse_refs_output(stdout)?;
    if refs.head.is_none() {
        refs.head = rev_parse::rev_parse(repo_path, "HEAD")?;
    }
    refs.merge_heads = merge_heads::merge_heads(repo_path)?;
    Ok(refs)
}
