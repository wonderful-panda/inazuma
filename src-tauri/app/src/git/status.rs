use super::commit_detail::{parse_numstat_tokens, parse_raw_numstat_rows};
use super::{exec, merge_heads, rev_parse, GitError};
use std::collections::HashMap;
use std::path::Path;
use types::*;

pub fn parse_status_row(text: &str) -> Result<Vec<WorkingTreeFileEntry>, GitError> {
    let mut ret: Vec<WorkingTreeFileEntry> = Vec::new();
    let mut lines: Vec<&str> = text.split("\0").collect();
    lines.reverse();
    while !lines.is_empty() {
        let line = lines.pop().unwrap();
        if line.len() == 0 {
            break;
        }
        let mode = &line[0..1];
        match mode {
            "1" => {
                // Ordinary changed entries
                // 1 <XY> <sub> <mH> <mI> <mW> <hH> <hI> <path>
                let path = line.splitn(9, " ").nth(8).unwrap();
                for (status_code, unstaged) in [(&line[2..3], false), (&line[3..4], true)] {
                    match status_code {
                        "M" | "T" | "A" | "D" => {
                            ret.push(WorkingTreeFileEntry::ordinal(path, status_code, unstaged))
                        }
                        "." => {
                            // unchanged
                        }
                        _ => {
                            return Err(GitError::UnexpectedOutput {
                                command: "status".to_owned(),
                                text: format!("unexpected status code: {}, {}", status_code, line),
                            });
                        }
                    }
                }
            }
            "2" => {
                // Renamed or copied entries
                // 2 <XY> <sub> <mH> <mI> <mW> <hH> <hI> <X><score> <path><sep><origPath>
                let path = line.splitn(10, " ").nth(9).unwrap();
                let old_path = lines.pop().unwrap();
                for (status_code, unstaged) in [(&line[2..3], false), (&line[3..4], true)] {
                    match status_code {
                        "M" | "T" | "A" | "D" => {
                            ret.push(WorkingTreeFileEntry::ordinal(path, status_code, unstaged))
                        }
                        "R" | "C" => ret.push(WorkingTreeFileEntry::renamed_or_copied(
                            path,
                            status_code,
                            old_path,
                            unstaged,
                        )),
                        "." => {
                            // unchanged
                        }
                        _ => {
                            return Err(GitError::UnexpectedOutput {
                                command: "status".to_owned(),
                                text: format!("unexpected status code: {}, {}", status_code, line),
                            });
                        }
                    }
                }
            }
            "u" => {
                // Unmerged entries
                // u <XY> <sub> <m1> <m2> <m3> <mW> <h1> <h2> <h3> <path>
                let xy = &line[2..4];
                let path = line.splitn(11, " ").nth(10).unwrap();
                ret.push(WorkingTreeFileEntry::unmerged(path, xy));
            }
            "?" => {
                // Untracked entries
                // ? <path>
                let path = &line[2..];
                ret.push(WorkingTreeFileEntry::untracked(path))
            }
            _ => {
                return Err(GitError::UnexpectedOutput {
                    command: "status".to_owned(),
                    text: format!("unexpected mode: {}", line),
                });
            }
        }
    }
    Ok(ret)
}

pub async fn status(repo_path: &Path) -> Result<Vec<WorkingTreeFileEntry>, GitError> {
    let args = vec!["--porcelain=v2", "--find-renames", "--untracked=all", "-z"];
    let output = exec(repo_path, "status", &args, &[]).await?;
    GitError::assert_process_output("status", &output)?;
    let stdout = std::str::from_utf8(&output.stdout).unwrap();
    parse_status_row(stdout)
}

pub async fn get_workingtree_stat(
    repo_path: &Path,
    cached: bool,
) -> Result<Vec<FileEntry>, GitError> {
    let mut args = vec!["--raw", "--numstat", "--find-renames", "-z"];
    if cached {
        args.push("--cached");
    }
    let output = exec(repo_path, "diff", &args, &[]).await?;
    GitError::assert_process_output("diff", &output)?;
    let stdout = std::str::from_utf8(&output.stdout).unwrap();
    parse_raw_numstat_rows(stdout)
}

pub async fn get_workingtree_delta(
    repo_path: &Path,
    cached: bool,
) -> Result<HashMap<String, FileDelta>, GitError> {
    let mut args = vec!["--numstat", "--find-renames", "-z"];
    if cached {
        args.push("--cached");
    }
    let output = exec(repo_path, "diff", &args, &[]).await?;
    GitError::assert_process_output("diff", &output)?;
    let stdout = std::str::from_utf8(&output.stdout).unwrap();
    let tokens = stdout
        .split("\0")
        .filter(|v| v.len() > 0)
        .collect::<Vec<_>>();
    let delta = parse_numstat_tokens(&tokens)?;
    Ok(delta.into_iter().collect())
}

pub async fn get_untracked_files(repo_path: &Path) -> Result<Vec<String>, GitError> {
    let args = vec!["-z", "--others", "--exclude-standard"];
    let output = exec(repo_path, "ls-files", &args, &[]).await?;
    GitError::assert_process_output("ls-files", &output)?;
    let stdout = std::str::from_utf8(&output.stdout).unwrap();
    let paths: Vec<String> = stdout
        .split("\0")
        .filter(|v| v.len() > 0)
        .map(|v| v.to_string())
        .collect();
    Ok(paths)
}

pub async fn get_workingtree_parents(repo_path: &Path) -> Result<Vec<String>, GitError> {
    let head = rev_parse::rev_parse(&repo_path, "HEAD").await?;
    match head {
        Some(head) => {
            let mut ret = vec![head];
            let mut merge_heads = merge_heads::get_merge_heads(&repo_path).await?;
            ret.append(&mut merge_heads);
            Ok(ret)
        }
        None => Ok(Vec::new()),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_ordinal() {
        const STATUS_OUTPUT: &str = "\
            1 MM N... 100644 100644 100644 xxxxxxx xxxxxxx src/modified both.rs\0\
            1 A. N... 100644 100644 100644 xxxxxxx xxxxxxx src/added staged.rs\0\
            1 .A N... 100644 100644 100644 xxxxxxx xxxxxxx src/added unstaged.rs\0\
            1 D. N... 100644 100644 100644 xxxxxxx xxxxxxx src/removed staged.rs\0\
            1 .D N... 100644 100644 100644 xxxxxxx xxxxxxx src/removed unstaged.rs\0\
            ";
        let expecteds = vec![
            WorkingTreeFileEntry::ordinal("src/modified both.rs", "M", false),
            WorkingTreeFileEntry::ordinal("src/modified both.rs", "M", true),
            WorkingTreeFileEntry::ordinal("src/added staged.rs", "A", false),
            WorkingTreeFileEntry::ordinal("src/added unstaged.rs", "A", true),
            WorkingTreeFileEntry::ordinal("src/removed staged.rs", "D", false),
            WorkingTreeFileEntry::ordinal("src/removed unstaged.rs", "D", true),
        ];

        let actuals = parse_status_row(STATUS_OUTPUT).unwrap();
        assert_eq!(expecteds, actuals);
    }

    #[test]
    fn test_parse_renamed() {
        const STATUS_OUTPUT: &str = "\
            2 R. N... 100644 100644 100644 xxxxxxx xxxxxxx R100 src/staged.rs\0src/staged orig.rs\0\
            2 .R N... 100644 100644 100644 xxxxxxx xxxxxxx R100 src/unstaged.rs\0src/unstaged orig.rs\0\
            2 RM N... 100644 100644 100644 xxxxxxx xxxxxxx R100 src/modified.rs\0src/modified orig.rs\0\
            ";
        let expecteds = vec![
            WorkingTreeFileEntry::renamed_or_copied(
                "src/staged.rs",
                "R",
                "src/staged orig.rs",
                false,
            ),
            WorkingTreeFileEntry::renamed_or_copied(
                "src/unstaged.rs",
                "R",
                "src/unstaged orig.rs",
                true,
            ),
            WorkingTreeFileEntry::renamed_or_copied(
                "src/modified.rs",
                "R",
                "src/modified orig.rs",
                false,
            ),
            WorkingTreeFileEntry::ordinal("src/modified.rs", "M", true),
        ];

        let actuals = parse_status_row(STATUS_OUTPUT).unwrap();
        assert_eq!(expecteds, actuals);
    }

    #[test]
    fn test_parse_unmerged() {
        const STATUS_OUTPUT: &str = "\
            u UU N... 100644 100644 100644 100644 xxxxxxx xxxxxxx xxxxxxx src/both modified.rs\0\
            u AA N... 100644 100644 100644 100644 xxxxxxx xxxxxxx xxxxxxx src/both added.rs\0\
            u DD N... 100644 100644 100644 100644 xxxxxxx xxxxxxx xxxxxxx src/both deleted.rs\0\
            u AU N... 100644 100644 100644 100644 xxxxxxx xxxxxxx xxxxxxx src/add by us.rs\0\
            u UA N... 100644 100644 100644 100644 xxxxxxx xxxxxxx xxxxxxx src/add by them.rs\0\
            u DU N... 100644 100644 100644 100644 xxxxxxx xxxxxxx xxxxxxx src/delete by us.rs\0\
            u UD N... 100644 100644 100644 100644 xxxxxxx xxxxxxx xxxxxxx src/delete by them.rs\0\
            ";
        let expecteds = vec![
            WorkingTreeFileEntry::unmerged("src/both modified.rs", "UU"),
            WorkingTreeFileEntry::unmerged("src/both added.rs", "AA"),
            WorkingTreeFileEntry::unmerged("src/both deleted.rs", "DD"),
            WorkingTreeFileEntry::unmerged("src/add by us.rs", "AU"),
            WorkingTreeFileEntry::unmerged("src/add by them.rs", "UA"),
            WorkingTreeFileEntry::unmerged("src/delete by us.rs", "DU"),
            WorkingTreeFileEntry::unmerged("src/delete by them.rs", "UD"),
        ];

        let actuals = parse_status_row(STATUS_OUTPUT).unwrap();
        assert_eq!(expecteds, actuals);
    }

    #[test]
    fn test_untracked() {
        const STATUS_OUTPUT: &str = "\
            ? src/untracked file.rs\0\
            ";
        let expecteds = vec![WorkingTreeFileEntry::untracked("src/untracked file.rs")];

        let actuals = parse_status_row(STATUS_OUTPUT).unwrap();
        assert_eq!(expecteds, actuals);
    }
}
