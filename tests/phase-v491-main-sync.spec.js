const { test, expect } = require('@playwright/test');
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..');
test('V491 clean branch retains current main PromptStory app',()=>{
 expect(fs.existsSync(path.join(root,'promptstory','index.html'))).toBe(true);
});
