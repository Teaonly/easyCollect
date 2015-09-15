# easyCollect
一个管理微博、浏览器收藏夹的小工具

采用 Nod.js 开发，通过浏览器操作，支持导入微博、浏览器等多种第三方的收藏。

* 支持基本的增、删、查操作，支持 Tag 编辑；

* 采用git服务器（如github）作为不同终端之间的同步，收藏种子基于文件存储，索引采用 nedb 数据库；

* 操作端采用命令行与 Web 两种交互方式，通过 Node.js 创建的 Web 服务使用浏览器操作；

* 通过微博等第三方 API 支持各种收藏数据的导入以及更新；

* 该工具主要面向码农，需要熟悉 Node.js 以及 git 两个工具；

## 1. 下载

直接通过 git clone 代码的形式，使用本工具。

```
$git clone https://github.com/Teaonly/easyCollect
$cd easyCollect
$npm install
$node index.js
```

当执行```node index.js```命令时，显示如下帮助信息：

```
Usage: node ./index.js --cmd [create|sync|view] --target db_folder --source [weibo|twitter]

Options:
  --cmd     create: Create DB, view: Use exist DB, sync: import and sync from source.  [required]
  --target  Database folder which stores index and feeds                               [required]
  --source  Source of collection, such as weibo

Missing required arguments: cmd, target
```

## 2. 初始化

首先我们需要创建一个空的目录，用于存放收藏数据，并且初始化数据文件。

```
$mkdir /tmp/mydb
$node index.js --cmd create --target /tmp/mydb
Created an empty database.
```

## 3. 导入收藏

对于一个空数据库，是没有任何收藏资料的，因此，我们我们需要导入新的收藏数据。
注意对于已经已经存在收藏资料的数据库，也通过该命令，增加新的收藏资料。

```
troop:easyCollect teaonly$ node index.js --cmd sync --target /tmp/mydb --source weibo
开始同步微博数据...
	===> 获取20/1140 ...
	===> 获取40/1140 ...
	===> 获取60/1140 ...
  [...中间省略]
	===> 获取1120/1140 ...
	===> 获取1140/1140 ...
同步完成！

```

## 4. 管理收藏

在完成导入或者同步好收藏源之后，可以直接使用 Web 管理收藏资料了。

```
troop:easyCollect teaonly$ node index.js --cmd view --target /tmp/mydb
Open http://127.0.0.1:8080/index.html with browser
```
