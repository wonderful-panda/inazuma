# inazuma

**NOT READY FOR USE**

Git repository browser made by Tauri and React

- Home
  ![home](/image/home.png)

- Log
  ![log](/image/log.png)

- Log (Another layout)
  ![log](/image/log-another-layout.png)

- Interactive shell integration
  ![shell](/image/shell-integration.png)

- Blame
  ![blame](/image/blame.png)

- Tree (with blame)
  ![lstree](/image/lstree-with-blame.png)

- Compare two commits
  ![commit-diff](/image/commit-difference.png)

## Build

1. Install node >= 14

1. Install yarn

   ```shell
   npm install yarn -g
   ```

1. Install rust and platform specific prerequisites of tauri
   according to [here](https://tauri.studio/guides/getting-started/prerequisites)

1. Clone from GitHub and run build script as below.

   ```shell
   git clone https://github.com/wonderful-panda/inazuma
   cd inazuma
   yarn
   yarn build
   ```

   :warning: memory >= 3GB must be available during bulid step.

## LICENSE

MIT
