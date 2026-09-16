// An allowlisted preview copy lets Next run without loading any workspace .env files.
const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..'),target=path.join(root,'.qa',process.argv[2] === 'build' ? 'build' : 'site');
fs.mkdirSync(target,{recursive:true});
for(const name of ['app','components','features','hooks','lib','providers','stores','types','package.json','package-lock.json','tsconfig.json','next-env.d.ts','next.config.mjs','postcss.config.mjs','tailwind.config.ts']) {
 fs.cpSync(path.join(root,name),path.join(target,name),{recursive:true,filter:src=>!/^\.env(?:\.|$)|\.env$/i.test(path.basename(src))});
}
if(!fs.existsSync(path.join(target,'node_modules')))fs.symlinkSync(path.join(root,'node_modules'),path.join(target,'node_modules'),'junction');
console.log('QA source staged without environment files.');
