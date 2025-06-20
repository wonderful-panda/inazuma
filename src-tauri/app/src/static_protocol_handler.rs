use http::response::Builder as ResponseBuilder;
use http::{Request, Response, StatusCode, Uri};
use std::borrow::Cow;
use tauri::{AppHandle, Manager, Runtime, UriSchemeResponder};
use tokio::spawn;

fn get_file_path_from_static_url(url: &Uri) -> Option<String> {
    let path = url.path();
    if path.starts_with('/') {
        Some(path[1..].to_string())
    } else {
        Some(path.to_string())
    }
}

fn get_content_type_from_extension(path: &str) -> &'static str {
    if path.ends_with(".html") {
        "text/html"
    } else if path.ends_with(".css") {
        "text/css"
    } else if path.ends_with(".js") {
        "application/javascript"
    } else if path.ends_with(".json") {
        "application/json"
    } else {
        "text/plain"
    }
}

fn build_static_response<T: Into<Cow<'static, [u8]>>>(
    data: T,
    content_type: &'static str,
) -> Response<Cow<'static, [u8]>> {
    let data: Cow<'static, [u8]> = data.into();
    ResponseBuilder::new()
        .status(StatusCode::OK)
        .header("Content-Type", content_type)
        .header("Content-Length", data.len())
        .header("Access-Control-Allow-Origin", "*")
        .header("Cache-Control", "max-age=3600")
        .body(data)
        .unwrap()
}

fn build_error_response(status: StatusCode) -> Response<Cow<'static, [u8]>> {
    ResponseBuilder::new()
        .status(status)
        .header("Content-Type", "text/plain")
        .body(Cow::Borrowed("Not Found".as_bytes()))
        .unwrap()
}

pub fn handle_request<R: Runtime>(
    app: AppHandle<R>,
    request: Request<Vec<u8>>,
    responder: UriSchemeResponder,
) {
    spawn(async move {
        let url = request.uri();
        debug!("static protocol request: {}", url);
        
        if let Some(file_path) = get_file_path_from_static_url(url) {
            // Only serve license files for security
            if file_path == "js-licenses.html" || file_path == "rust-licenses.html" {
                match app.path().resource_dir() {
                    Ok(resource_dir) => {
                        let resource_path = resource_dir.join(&file_path);
                        match std::fs::read(&resource_path) {
                            Ok(content) => {
                                let content_type = get_content_type_from_extension(&file_path);
                                responder.respond(build_static_response(content, content_type));
                            }
                            Err(e) => {
                                warn!("Failed to read resource file {}: {}", resource_path.display(), e);
                                responder.respond(build_error_response(StatusCode::NOT_FOUND));
                            }
                        }
                    }
                    Err(e) => {
                        warn!("Failed to get resource directory: {}", e);
                        responder.respond(build_error_response(StatusCode::INTERNAL_SERVER_ERROR));
                    }
                }
            } else {
                warn!("Blocked request for non-license file: {}", file_path);
                responder.respond(build_error_response(StatusCode::FORBIDDEN));
            }
        } else {
            responder.respond(build_error_response(StatusCode::BAD_REQUEST));
        }
    });
}