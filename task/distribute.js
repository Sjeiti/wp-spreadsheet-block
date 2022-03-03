const { program } = require('commander')
const {resolve, join} = require('path')

const {
  existsSync,
  promises: {
    readFile,
    writeFile,
    mkdir,
    readdir,
    copyFile
  }
} = require('fs')

const {tag} = program
  .option('-t, --tag')
  .parse()
  .opts()

const filePackage = 'package.json'
const folderPluginBuild = 'httpdocs/wp-content/plugins/spreadsheet-block'
const folderPluginTarget = 'wordpress-svn/trunk'
const fileReadmeTxt = resolve(folderPluginBuild, 'README.txt')
const filePHP = resolve(folderPluginBuild, 'spreadsheet-block.php')

;(async function(){
  const packageJsonContents = await readFile(filePackage)
  const packageJson = JSON.parse(packageJsonContents)
  const version = packageJson.version
  const folderPluginTagTarget = 'wordpress-svn/tags/'+version

  console.info('Distributing',packageJson.name,version)

  await Promise.all([filePHP,fileReadmeTxt].map(async file=>{
    const contents = await readFile(file)
    const newContents = contents.toString()
      .replace(/(Stable\stag:\s)(\d+\.\d+\.\d+)/, '$1'+version)
      .replace(/(\s\*\sVersion:\s+)(\d+\.\d+\.\d+)/, '$1'+version)
    return writeFile(file, newContents).then(()=>console.info(' -', file.split(/[\\\/]/g).pop(), 'written'))
  }))

  await copyDir(folderPluginBuild, tag?folderPluginTagTarget:folderPluginTarget)
})()

async function copyDir(src,dest) {
  const entries = await readdir(src,{withFileTypes: true})
  existsSync(dest) || await mkdir(dest)
  for (let entry of entries) {
    const srcPath = join(src,entry.name)
    const destPath = join(dest,entry.name)
    if (entry.isDirectory()) {
      await copyDir(srcPath,destPath)
    } else {
      await copyFile(srcPath,destPath)
    }
  }
}
