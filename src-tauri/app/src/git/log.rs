use super::commit_detail::parse_raw_numstat_rows;
use super::{exec, GitError};
use std::path::Path;
use types::*;

/* LOG FORMAT
 *
 * id:{id}\n
 * parents:{parents}\n
 * author:{author}\n
 * date:{author-date}\n
 * summary:{summary}\n
 */
const LOG_FORMAT: &str = "\
    id:%H%n\
    parents:%P%n\
    author:%an%n\
    mail:%ae%n\
    date:%at%n\
    summary:%s";

const ID: &str = "id";
const PARENTS: &str = "parents";
const AUTHOR: &str = "author";
const MAIL: &str = "mail";
const DATE: &str = "date";
const SUMMARY: &str = "summary";

pub fn parse_log_output(output: &str) -> Result<Vec<Commit>, GitError> {
    let mut id = "";
    let mut parents = "";
    let mut author = "";
    let mut mail_address = "";
    let mut date: u64 = 0;
    let mut commits: Vec<Commit> = Vec::new();
    for line in output.lines() {
        let kv: Vec<&str> = line.splitn(2, ':').collect();
        match kv.as_slice() {
            [ID, value] => {
                id = value;
            }
            [PARENTS, value] => {
                parents = value;
            }
            [AUTHOR, value] => {
                author = value;
            }
            [MAIL, value] => {
                mail_address = value;
            }
            [DATE, value] => {
                date = value.parse::<u64>().unwrap() * 1000;
            }
            [SUMMARY, value] => {
                commits.push(Commit::new(id, parents, author, mail_address, date, value));
                id = "";
                parents = "";
                author = "";
                mail_address = "";
                date = 0;
            }
            _ => {
                return Err(GitError::UnexpectedOutput {
                    command: String::from("log"),
                    text: line.to_string(),
                })
            }
        }
    }
    Ok(commits)
}

fn max_count_option(max_count: u32) -> String {
    if max_count > 0 {
        format!("-{}", max_count)
    } else {
        String::from("")
    }
}

fn build_args<'a>(
    format: &'a str,
    max_count_option: &'a str,
    all: bool,
    heads: &[&'a str],
) -> Vec<&'a str> {
    let mut args: Vec<&str> = Vec::new();
    if heads.len() > 0 {
        for h in heads {
            args.push(h);
        }
    }
    if all {
        for a in ["--branches", "--tags", "--remotes", "HEAD"].iter() {
            args.push(a);
        }
    }
    args.push("--topo-order");
    args.push(format);
    if max_count_option != "" {
        args.push(max_count_option);
    }
    args
}

pub async fn log(
    repo_path: &Path,
    max_count: u32,
    all: bool,
    heads: &[&str],
) -> Result<Vec<Commit>, GitError> {
    let max_count_option = max_count_option(max_count);
    let format = format!("--format={}", LOG_FORMAT);
    let args = build_args(format.as_str(), max_count_option.as_str(), all, heads);
    let output = exec(repo_path, "log", &args, &[]).await?;
    GitError::assert_process_output("log", &output)?;
    let stdout = std::str::from_utf8(&output.stdout).unwrap();
    let commits = parse_log_output(stdout)?;
    Ok(commits)
}

pub fn parse_filelog_output(output: &str) -> Result<Vec<FileLogEntry>, GitError> {
    /* LOG FORMAT with -z --name-status
     *
     * \n
     * id:{id}\n
     * parents:{parents}\n
     * author:{author}\n
     * date:{author-date}\n
     * summary:{summary}\0\n  # "\0\n" added before NUMSTAT ROW
     * <NUMSTAT ROW>
     */

    let mut id = "";
    let mut parents = "";
    let mut author = "";
    let mut mail_address = "";
    let mut date: u64 = 0;
    let mut summary = "";
    let mut entries: Vec<FileLogEntry> = Vec::new();
    for line in output.lines() {
        if line.len() == 0 {
            continue;
        }
        let kv: Vec<&str> = line.splitn(2, ':').collect();
        match kv.as_slice() {
            [ID, value] => {
                id = value;
            }
            [PARENTS, value] => {
                parents = value;
            }
            [AUTHOR, value] => {
                author = value;
            }
            [MAIL, value] => {
                mail_address = value;
            }
            [DATE, value] => {
                date = value.parse::<u64>().unwrap() * 1000;
            }
            [SUMMARY, value] => {
                // last char is '\0'
                summary = &value[..value.len() - 1];
            }
            _ => {
                // stat line
                let commit = Commit::new(id, parents, author, mail_address, date, summary);
                let entry = parse_raw_numstat_rows(line)?.remove(0);
                entries.push(FileLogEntry { commit, entry });
                id = "";
                parents = "";
                author = "";
                mail_address = "";
                date = 0;
                summary = "";
            }
        }
    }
    Ok(entries)
}

pub async fn filelog(
    repo_path: &Path,
    rel_path: &str,
    max_count: u32,
    all: bool,
    heads: &[&str],
) -> Result<Vec<FileLogEntry>, GitError> {
    let max_count_option = max_count_option(max_count);
    let format = format!("--format=%n{}", LOG_FORMAT);
    let mut args = build_args(format.as_str(), max_count_option.as_str(), all, heads);
    args.push("--follow");
    args.push("-z");
    args.push("--raw");
    args.push("--numstat");
    args.push("--");
    args.push(rel_path);
    let output = exec(repo_path, "log", &args, &[]).await?;
    GitError::assert_process_output("log", &output)?;
    let stdout = std::str::from_utf8(&output.stdout).unwrap();
    let entries = parse_filelog_output(stdout)?;
    Ok(entries)
}

pub async fn get_last_modify_commit(
    repo_path: &Path,
    rel_path: &str,
    revspec: &str,
) -> Result<Option<Commit>, GitError> {
    let format = format!("--format={}", LOG_FORMAT);
    let args = vec![format.as_str(), "-1", revspec, "--", rel_path];
    let output = exec(repo_path, "log", &args, &[]).await?;
    GitError::assert_process_output("log", &output)?;
    let stdout = std::str::from_utf8(&output.stdout).unwrap();
    let mut commits = parse_log_output(stdout)?;

    if commits.is_empty() {
        Ok(None)
    } else {
        Ok(Some(commits.remove(0)))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parse_test() {
        const LOG_OUTPUT: &str = "\
            id:5cc9b4bc00000000000000000000000000000000\n\
            parents:4f158cd300000000000000000000000000000000 749b9a9000000000000000000000000000000000\n\
            author:Carol\n\
            mail:carol@example.com\n\
            date:1612789513\n\
            summary:\n\
            id:749b9a9000000000000000000000000000000000\n\
            parents:4f158cd300000000000000000000000000000000\n\
            author:Bob\n\
            mail:bob@example.com\n\
            date:1612789146\n\
            summary:second commit\n\
            id:4f158cd300000000000000000000000000000000\n\
            parents:\n\
            author:Alice\n\
            mail:alice@example.com\n\
            date:1612789108\n\
            summary:first commit\n\
        ";
        let expected =
            vec![
            Commit::new(
                "5cc9b4bc00000000000000000000000000000000",
                "4f158cd300000000000000000000000000000000 749b9a9000000000000000000000000000000000",
                "Carol",
                "carol@example.com",
                1612789513000,
                ""),
            Commit::new(
                "749b9a9000000000000000000000000000000000",
                "4f158cd300000000000000000000000000000000",
                "Bob",
                "bob@example.com",
                1612789146000,
                "second commit"),
            Commit::new(
                "4f158cd300000000000000000000000000000000",
                "",
                "Alice",
                "alice@example.com",
                1612789108000,
                "first commit"),
        ];

        let commits = parse_log_output(LOG_OUTPUT).unwrap();
        assert_eq!(expected.len(), commits.len());
        for (commit, exp) in commits.iter().zip(&expected) {
            assert_eq!(exp, commit);
        }
    }
}
