use super::state::avatars::AvatarsState;
use http::response::Builder as ResponseBuilder;
use http::{Request, Response, StatusCode, Uri};
use std::borrow::Cow;
use tauri::{AppHandle, Manager, Runtime, UriSchemeResponder};
use tokio::spawn;
use urlencoding::decode;

fn get_mail_address_from_avatar_url(url: &Uri) -> Option<String> {
    if let Ok(path) = decode(url.path()) {
        if path.len() < 2 {
            None
        } else {
            Some(path[1..].to_owned())
        }
    } else {
        None
    }
}

fn build_avatar_response<T: Into<Cow<'static, [u8]>>>(
    data: T,
    content_type: &'static str,
) -> Response<Cow<'static, [u8]>> {
    let data: Cow<'static, [u8]> = data.into();
    ResponseBuilder::new()
        .status(StatusCode::OK)
        .header("Content-Type", content_type)
        .header("Content-Length", data.len())
        .header("Access-Control-Allow-Origin", "*")
        .header("Cache-Control", "max-age=86400")
        .body(data)
        .unwrap()
}

pub fn handle_request<R: Runtime>(
    app: AppHandle<R>,
    request: Request<Vec<u8>>,
    responder: UriSchemeResponder,
) {
    // [Material Design Icons] mdi:user
    // https://icon-sets.iconify.design/mdi/user/
    const DEFAULT_AVATAR: &[u8] =
            "<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24'>\
                <rect width='24' height='24' fill='darkgray' />\
                <path fill='dimgray' d='M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4' />\
            </svg>"
            .as_bytes();

    spawn(async move {
        let avatars = app.state::<AvatarsState>();
        let url = request.uri();
        debug!("accept: {}", url);
        if let Some(mail) = get_mail_address_from_avatar_url(url) {
            if mail.eq("__DEFAULT__") {
                responder.respond(build_avatar_response(DEFAULT_AVATAR, "image/svg+xml"));
            } else if let Ok(Some(data)) = avatars.fetch_avatar(mail).await {
                responder.respond(build_avatar_response(Vec::clone(&*data), "image/png"));
            } else {
                responder.respond(build_avatar_response(DEFAULT_AVATAR, "image/svg+xml"));
            }
        } else {
            responder.respond(build_avatar_response(DEFAULT_AVATAR, "image/svg+xml"));
        }
    });
}
