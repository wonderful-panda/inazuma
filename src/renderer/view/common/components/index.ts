import Vue from "vue";
import { SplitterPanel } from "./splitterPanel";
import { TextField, TextFieldHelptext } from "./textField";
import { TextButton } from "./textButton";
import { IconButton, ToolbarButton, CloseButton } from "./iconButton";

Vue.component("icon-button", IconButton);
Vue.component("toolbar-button", ToolbarButton);
Vue.component("close-button", CloseButton);
Vue.component("text-button", TextButton);
Vue.component("text-field", TextField);
Vue.component("text-field-helptext", TextFieldHelptext);
Vue.component("splitter-panel", SplitterPanel);
