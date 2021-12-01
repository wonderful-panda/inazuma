mod bridge;
mod git;

use bridge::*;
use neon::prelude::*;

register_module!(mut cx, {
    cx.export_function("logAsync", log::log_async)?;
    cx.export_function("filelogAsync", log::filelog_async)?;
    cx.export_function(
        "getCommitDetailAsync",
        bridge::commit_detail::get_commit_detail_async,
    )?;
    cx.export_function(
        "getWorkingTreeStatAsync",
        bridge::status::get_workingtree_stat_async,
    )?;
    cx.export_function(
        "getChangesBetweenAsync",
        bridge::diff::get_changes_between_async,
    )?;
    cx.export_function(
        "getWorkingTreeUdiffAsync",
        bridge::diff::get_workingtree_udiff_async,
    )?;
    cx.export_function(
        "getUntrackedFilesAsync",
        bridge::status::get_untracked_files_async,
    )?;
    cx.export_function(
        "getWorkingTreeParentsAsync",
        bridge::status::get_workingtree_parents_async,
    )?;
    cx.export_function("lstreeAsync", bridge::lstree::lstree_async)?;
    cx.export_function("refsAsync", refs::refs_async)?;
    cx.export_function("blameAsync", blame::blame_async)?;
    cx.export_function("getContentAsync", file::get_content_async)?;
    cx.export_function("saveToAsync", file::save_to_async)?;
    cx.export_function("addToIndexAsync", bridge::index::add_to_index_async)?;
    cx.export_function(
        "removeFromIndexAsync",
        bridge::index::remove_from_index_async,
    )?;
    cx.export_function(
        "findRepositoryRootAsync",
        find_repository_root::find_repository_root_async,
    )?;
    cx.export_function("commitAsync", commit::commit_async)?;
    Ok(())
});
