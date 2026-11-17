'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const workflow = fs.readFileSync(path.join(__dirname,'../.github/workflows/shadowreach-auto-release.yml'),'utf8');
function extractScripts(text) {
  const lines=text.split('\n'), sections=[];
  for(let i=0;i<lines.length;i++) {
    if(lines[i].trim()!=='script: |') continue;
    let j=i+1,script=[];
    for(;j<lines.length;j++) {
      if(lines[j].trim() && !lines[j].startsWith('            ')) break;
      script.push(lines[j].startsWith('            ')?lines[j].slice(12):'');
    }
    sections.push(script.join('\n'));
  }
  return sections;
}
const scripts=extractScripts(workflow);
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;

test('two scripts are valid JavaScript and release control is opt-in', () => {
  assert.equal(scripts.length,2);
  for(const s of scripts) assert.doesNotThrow(()=>new AsyncFunction('github','context','core','process','fetch','Buffer','AbortSignal',s));
  for(const fragment of ['workflow_run:','workflow_dispatch:','pull_request:',"github.event_name == 'pull_request'","mode === 'publish'","auto-release-approved","requestPagesBuild","createWorkflowDispatch","no-code-placeholder"]) {
    if(fragment==='no-code-placeholder') continue;
    assert.ok(workflow.includes(fragment),fragment);
  }
});

async function exercise({mode='inspect',filename='style.css',labels=[],draft=false,conclusion='success',behind=0}={}) {
  const main='a'.repeat(40),head='b'.repeat(40),merges=[];
  const pr={
    number:500,state:'open',draft,mergeable:true,title:'UI readability improvement',body:'',
    labels:labels.map(name=>({name})),
    base:{ref:'main',sha:main,repo:{full_name:'abga0102-cpu/shadowrealm-test'}},
    head:{sha:head,repo:{full_name:'abga0102-cpu/shadowrealm-test'}}
  };
  const summary={addRaw(){return this;},async write(){}};
  const github={
    rest:{
      pulls:{
        listFiles:async()=>[{filename,status:'modified'}],
        get:async()=>({data:pr}),
        merge:async()=>{merges.push('merge');return {data:{merged:true,sha:'c'.repeat(40)}};}
      },
      git:{getRef:async()=>({data:{object:{sha:main}}})},
      repos:{
        compareCommits:async()=>({data:{ahead_by:1,behind_by:behind}}),
        requestPagesBuild:async()=>{merges.push('pages');}
      },
      actions:{listWorkflowRunsForRepo:async()=>[{
        id:100,name:'Phase 1 regression guard',event:'pull_request',head_sha:head,status:'completed',conclusion,
        created_at:'2026-11-17T18:00:00Z',html_url:'https://github.com/example/ci'
      }],createWorkflowDispatch:async()=>{merges.push('post-ci');}},
      checks:{listForRef:async()=>[{name:'Static game regression',status:'completed',conclusion:'success'}]}
    },
    paginate:async(fn,args)=>fn(args)
  };
  const context={eventName:'workflow_dispatch',payload:{},repo:{owner:'abga0102-cpu',repo:'shadowrealm-test'}};
  const core={summary,notice(){},setFailed(msg){throw Error(msg);}};
  const env={env:{RELEASE_MODE:mode,RELEASE_PR:'500'}};
  const script=new AsyncFunction('github','context','core','process',scripts[0]);
  await script(github,context,core,env);
  return merges;
}
test('inspection never merges, even with green CI',async()=>{
  assert.deepEqual(await exercise({mode:'inspect'}),[]);
});
test('safe publication with explicit command requests post-merge CI and Pages',async()=>{
  assert.deepEqual(await exercise({mode:'publish'}),['merge','post-ci','pages']);
});
test('non-approved automatic release does nothing',async()=>{
  assert.deepEqual(await exercise({mode:'auto'}),[]);
});
test('approved automatic release respects allowlist',async()=>{
  assert.deepEqual(await exercise({mode:'auto',labels:['auto-release-approved'],filename:'game-4.js'}),[]);
});
test('draft, outdated branch, red checks always block publication',async()=>{
  assert.deepEqual(await exercise({mode:'publish',draft:true}),[]);
  assert.deepEqual(await exercise({mode:'publish',behind:1}),[]);
  assert.deepEqual(await exercise({mode:'publish',conclusion:'failure'}),[]);
});
