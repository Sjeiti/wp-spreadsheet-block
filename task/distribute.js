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


const filePackage = 'package.json'
const folderPluginBuild = 'httpdocs/wp-content/plugins/spreadsheet-block'
const folderPluginTarget = 'temp/test/spreadsheet-block'
const fileReadmeTxt = resolve(folderPluginBuild, 'README.txt')
const filePHP = resolve(folderPluginBuild, 'spreadsheet-block.php')

;(async function(){
  const packageJsonContents = await readFile(filePackage)
  const packageJson = JSON.parse(packageJsonContents)
  const version = packageJson.version

  console.info('Distributing',packageJson.name,version)

  ;[filePHP,fileReadmeTxt].forEach(async file=>{
    const contents = await readFile(file)
    const newContents = contents.toString()
      .replace(/(Stable\stag:\s)(\d+\.\d+\.\d+)/, '$1'+version)
      .replace(/(\s\*\sVersion:\s+)(\d+\.\d+\.\d+)/, '$1'+version)
    writeFile(file, newContents).then(()=>console.info(file+' written'))
  })

  await copyDir(folderPluginBuild, folderPluginTarget)
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
