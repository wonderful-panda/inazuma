use std::error::Error;
#[allow(unused_imports)]
use thiserror::Error;

#[cfg(not(target_os = "windows"))]
pub fn split_commandline(s: &str) -> Result<Vec<String>, Box<dyn Error + Send + Sync>> {
    shell_words::split(s).map_err(|e| e.into())
}

#[cfg(target_os = "windows")]
pub fn split_commandline(s: &str) -> Result<Vec<String>, Box<dyn Error + Send + Sync>> {
    split_commandline_windows(s)
}

#[cfg(target_os = "windows")]
#[derive(Error, Debug)]
pub enum WindowsError {
    #[error("Failed to parse command line string ({command_line})")]
    CommandLineParseError { command_line: String },
}

#[cfg(target_os = "windows")]
fn split_commandline_windows(s: &str) -> Result<Vec<String>, Box<dyn Error + Send + Sync>> {
    use core::slice;
    use std::ffi::OsString;
    use std::os::windows::ffi::OsStringExt;
    use winapi::ctypes::c_int;
    use winapi::shared::minwindef::HLOCAL;
    use winapi::um::shellapi;
    use winapi::um::winbase::LocalFree;
    let mut ret: Vec<String> = Vec::new();
    if s.is_empty() {
        return Ok(ret);
    }
    unsafe {
        let mut num_args: c_int = 0;
        let u16str: Vec<u16> = s.encode_utf16().chain(Some(0)).collect();
        let args = shellapi::CommandLineToArgvW(u16str.as_ptr(), &mut num_args);
        if args.is_null() {
            return Err(Box::new(WindowsError::CommandLineParseError {
                command_line: s.to_owned(),
            }));
        }
        let max_len: isize = 1024;
        for ptr in slice::from_raw_parts(args, num_args as usize) {
            let len = (0..max_len)
                .position(|i| *ptr.offset(i) == 0)
                .unwrap_or(max_len as usize);
            let arg = OsString::from_wide(slice::from_raw_parts(*ptr, len))
                .to_string_lossy()
                .into_owned();
            ret.push(arg);
        }
        LocalFree(args as HLOCAL);
    }
    Ok(ret)
}

#[cfg(test)]
mod tests {
    #[allow(unused_imports)]
    use super::*;

    #[cfg(target_os = "windows")]
    #[test]
    fn test_win_split_commandline_empty() {
        let ret = split_commandline("").unwrap();
        assert_eq!(ret, Vec::<String>::new());
    }

    #[cfg(target_os = "windows")]
    #[test]
    fn test_win_split_commandline_basic() {
        let ret = split_commandline("a b c").unwrap();
        assert_eq!(ret, vec!["a", "b", "c"]);
    }

    #[cfg(target_os = "windows")]
    #[test]
    fn test_win_split_commandline_quoted() {
        let ret =
            split_commandline(r#""C:\Program Files\test\test.exe" aaa "bbb ccc" " " " ddd ""#)
                .unwrap();
        assert_eq!(
            ret,
            vec![
                r"C:\Program Files\test\test.exe",
                "aaa",
                "bbb ccc",
                " ",
                " ddd "
            ]
        );
    }
}
