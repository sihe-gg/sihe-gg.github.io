# Hugo 博客搭建 + 使用 Github 部署作为自己的站点

# Hugo 博客搭建 + 使用 Github Page 部署作为站点并用 Github Action 自动部署站点

## 一、概述

作为一名程序员，需要有自己的博客记录一些学习笔记，所以记录自己搭建博客的过程，以供参考。

博客框架选择使用 Go 编写的 Hugo ，它在 Github 上的 Star 63k ，部署在 Github Page ，搭配 Github Action 实现自动化发布博客。

搭建环境:

- 操作系统: Ubuntu 18.04
- 博客框架: [Hugo](https://github.com/gohugoio/hugo)
- 博客主题: [LoveIt](https://github.com/dillonzq/LoveIt)
- 工具: Git

## 二、博客搭建

### （一）Hugo 框架下载

1、首先进入到 Hugo Github 下载 Releases 最新版本，我用的是 v0.104.3。

![Untitled](../images/Untitled.png)

- 我下载的是 hugo_0.104.3_linux-amd64.tar.gz，Intel 使用 amd 安装包，AMD 选择 arm 安装包，window 用户选择对应 window 安装包即可，不确定自己的 cpu 架构可以在 Linux 系统下输入 uname -m 查看。关于 amd 与 arm 更多知识请看____。（埋坑）

2、下载完成后，解压缩包。

```bash
mkdir hugo
tar -zxvf hugo_0.104.3_linux-amd64.tar.gz -C hugo
```

- 如果是下载 tar.gz 那么需要手动配置 Linux 环境变量，$PATH: 后面跟你 hugo 目录的绝对路径。

```bash
echo "export PATH=$PATH:/home/jaks/hugo" >> ~/.bashrc
```

3、输入 hugo version 打印出版本信息即安装成功。

### （二）Hugo 框架配置

1、在 Linux home 目录下使用 hugo 命令创建一个新的站点。

```bash
hugo new site hugo-site
```

- 之后添加博客主题，这里我选用的是 LoveIt 主题，更多精美主题可前往 [主题](https://themes.gohugo.io) 查看。

2、进入你的 hugo-site 目录，使用 Git 初始化目录，然后从 Github 下载主题到站点的 themes 目录。

```bash
cd hugo-site
git init
git submodule add https://github.com/dillonzq/LoveIt.git themes/LoveIt
```

3、配置文件替换，进入下载的主题找到 exampleSite 目录下的 config.toml 文件复制到 hugo-site 目录。

### （三）添加一些内容

1、使用 hugo 自带命令创建一个带有固定格式的 .md 文件到 content 目录。 

```bash
hugo new posts/my-first-post.md
```

2、使用 vim 打开 my-first-post.md 会看到 draft: true。

- 草稿不会被部署，一旦完成文章，更新草稿头部的 draft: false 即可在发布博客时显示文章。

### （四）启动 hugo 服务

1、现在可以启动 hugo 博客查看了！

```bash
hugo server -D

| EN
+------------------+----+
  Pages            | 10
  Paginator pages  |  0
  Non-page files   |  0
  Static files     |  3
  Processed images |  0
  Aliases          |  1
  Sitemaps         |  1
  Cleaned          |  0

Total in 11 ms
Watching for changes in /Users/bep/quickstart/{content,data,layouts,static,themes}
Watching for config changes in /Users/bep/quickstart/config.toml
Environment: "development"
Serving pages from memory
Running in Fast Render Mode. For full rebuilds on change: hugo server --disableFastRender
Web Server is available at http://localhost:1313/ (bind address 127.0.0.1)
Press Ctrl+C to stop
```

- 博客地址为 http://localhost:1313
- 在编辑或者添加新的博客文件时只需要刷新页面即可看到更新。（有时你需要 Ctrl + R  强刷浏览器）。

## 三、使用 Github 作为博客站点

到这一步你已经成功完成了 hugo 博客的搭建，现在需要通过域名发布博客让更多的人看到，我选择使用 Github Page 进行博客站点的发布，无需任何费用。

### （一）配置 Github SSH key

1、通过配置 ssh 即可无需输入 账号密码安全访问 repo，进入到 Linux home 目录。输入如下命令生成 ssh key。

2、首先配置如下命令，如有配置可跳过。

```bash
git config --global user.name 'xxx'
git config --global user.email 'xxx@xx.xxx'
```

3、生成密钥。

```bash
ssh-keygen -t rsa -C '上面的邮箱'
```

代码参数的含义

- -t 指定密钥类型，默认是 rsa，可以省略
- -C 设置注释文字，比如邮箱
- -f 指定密钥文件的存储文件名

4、按回车后进入 .ssh 获取公钥，id_rsa 是私钥，id_rsa.pub 是公钥。

```bash
cd ./.ssh
vim id_rsa.pub
```

![Untitled](../images/Untitled%201.png)

5、复制 id_rsa.pub 公钥，进入 Github 设置远程登陆。点击右上角头像 → Setting 。

![Untitled](../images/Untitled%202.png)

6、会看到左边这些目录，选择 SSH and GPG keys。

![Untitled](../images/Untitled%203.png)

7、创建 New SSH key，粘贴你的公钥到 key 中，Title 可以随意设置，Key type 默认第一个即可。使用下面的命令测试以下配置是否成功。

```bash
ssh -T git@github.com
```

8、看到以下信息 Github SSH key 就配置成功了。

![Untitled](../images/Untitled%204.png)

### （二）创建 Github Page 页面

1、首先，登录到 Github，右上角头像选择 Your repositories

![Untitled](../images/Untitled%205.png)

 2、选择 New

![Untitled](../images/Untitled%206.png)

 3、在 Repository name 一栏填写你的 Github 名称 + github.io，eg: sihe-gg.github.io。我已经创建过了，所以填写了 yourname.github.io，把 yourname 换成你的 github 名称。

![Untitled](../images/Untitled%207.png)

### （三）部署博客到 Github Page

1、创建完成你的 Github Page 之后，进入到 Linux 命令行，到 hugo-site 目录下输入如下命令生成你的博客页面，同时也会将 ./content 下草稿为 false（draft:  false） 的文章发布。

```bash
hugo

Start building sites … 
hugo v0.104.3-58b824581360148f2d91f5cc83f69bd22c1aa331 linux/amd64 BuildDate=2022-10-04T14:25:23Z VendorInfo=gohugoio

                   | EN  | ZH-CN  
-------------------+-----+--------
  Pages            |   7 |    10  
  Paginator pages  |   0 |     0  
  Non-page files   |   0 |     0  
  Static files     | 108 |   108  
  Processed images |   0 |     0  
  Aliases          |   1 |     2  
  Sitemaps         |   2 |     1  
  Cleaned          |   0 |     0  

Total in 599 ms
```

2、进入到 ./public 可以看到 hugo 自动生成的博客框架，我们需要做的是把 ./public 目录下的所有文件上传到 yourname.github.io 中。进入到 ./public 输入如下命令。

```bash
# 初始化 git 仓库
git init
# 指定远程仓库
git remote add origin git@github.com:yourname/yourname.github.io.git
# 添加所有文件
git add .   
# 提交                  
git commit -m '博客页面'
# 推送至 Github
git push --set-upstream origin master
```

3、大功告成了，输入网址 http://yourname.github.io ，现在快去看看你的博客吧，let`s go！

但是！当我们写完博客文章后，还需要输入 hugo 生成网站，手动切换到 ./public 目录上传，操作比较繁琐，这时我们可以使用 Github Action 自动化操作部署。

## 四、使用 Github Action 自动部署博客

Github Action 是一个持续集成和持续交付（CI/CD）平台，可用于自动执行构建、测试和部署管道，目前已经有很多开发好的工作流，可以通过简单的配置即可直接使用。

1、再创建一个仓库名为 myBlog，并设为私有 Private

![Untitled](../images/Untitled%208.png)

2、现在应该上传我们的 hugo-site 目录到 myBlog 仓库，进入 Linux 界面，找到并进入你的 hugo-site 目录，由于刚才已经使用 git init 命令初始化过该目录，依次使用如下命令上传至 Github 仓库。

 

```bash
# 指定远程仓库
git remote add origin git@github.com:yourname/myBlog.git
# 添加所有文件
git add .   
# 提交                  
git commit -m '博客代码'
# 推送至 Github
git push --set-upstream origin master
```

3、推送完成后，在 blog-site 目录下新建目录 .github，创建一个自动化发布博客的 .yml 配置文件。

```bash
mkdir .github/workflows
cd ./.github/workflows
vim myAction.yml
```

4、在 myAction.yml 配置文件中填写如下信息。

```yaml
name: github pages

# on 是 Actions 的触发条件，这里的配置说明当 master 分支有提交的时候，根据这个配置文件执行
on:
  push:
    branches:
      - main # Set a branch to deploy

# jobs 是要执行的任务，我们看到他要执行 deploy
jobs:
  deploy:
    runs-on: ubuntu-18.04 # 运行环境
    steps: # 执行步骤

      # checkout 分支
      - uses: actions/checkout@v2
        with:
          submodules: true  # Fetch Hugo themes (true OR recursive)
          fetch-depth: 0    # Fetch all history for .GitInfo and .Lastmod

      # 安装 hugo
      - name: Setup Hugo
        uses: peaceiris/actions-hugo@v2
        with:
          hugo-version: 'latest'
          # extended: true

      # 编译站点
      - name: Build
        run: hugo

      # 创建 CNAME，这个是原始配置中没有的
      #- uses: "finnp/create-file-action@master"
      #  env:
      #    FILE_NAME: "./public/CNAME"
      #    FILE_DATA: "h1z3y3.me"

      # 将站点发布到对应分支
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.PERSONAL_TOKEN }}
          EXTERNAL_REPOSITORY: yourname/yourname.github.io
          PUBLISH_BRANCH: main
          publish_dir: ./public
```

5、在配置文件中需要修改的是 

- on:
  push:
    branches:
      - main # 这里修改为 myBlog 的主分支名称

![Untitled](../images/Untitled%209.png)

如上图，我的 branches 需要修改为 main → master。

- jobs:
  deploy:
    
           - name: Deploy
    
    EXTERNAL_REPOSITORY: 填写刚才创建的 Github Page 库地址
    
    PUBLISH_BRANCH： 如上图查看主分支名称填写
    

6、还差一步，申请 Github token

- 进入 Github，右上角头像 → setting

![Untitled](../images/Untitled%202.png)

- 左边菜单栏选择最底部 Developer settings → Personal access tokens

![Untitled](../images/Untitled%2010.png)

![Untitled](../images/Untitled%2011.png)

- 选择 Generate new token，再次输入密码后，进入页面，注意：需要在 Select scopes 中勾选 repo 和 workflow，Expiration 过期日期写的长一点。

![Untitled](../images/Untitled%2012.png)

- 点击 Generate token，复制新生成的 token，注意：只显示一次，不要弄丢。

![Untitled](../images/Untitled%2013.png)

- 进入 myBlog 页面，点击 Settings

![Untitled](../images/Untitled%2014.png)

- 选择 Secrets → Actions → New repository secret

![Untitled](../images/Untitled%2015.png)

- Name 填写 PERSONAL_TOKEN，Secret 填写刚刚申请的 token

![Untitled](../images/Untitled%2016.png)

7、最后，只需要用如下 git 命令上传到 myBlog 库中，每次写完博客文章 git push 推送完成后就可以自动执行 hugo 命令，生成在 public 目录下的所有文件上传至你的 Github Page，自动化生成你的博客网页。

```bash
git add .
git commit -m 'upload action config'
git push
```

至此，我们的 Hugo 博客就搭建完成了，每当我们通过 Markdown 语法完成博客内容编辑后，只需要推送至私人仓库，等待几分钟， Github Action 就会自动化发布你的博客，再通过 Github Page 上你的域名去访问更新后的博客。

