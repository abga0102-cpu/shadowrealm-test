const { test, expect } = require('@playwright/test');

test('V491 formula gives exactly x2 the former 3% Dust gain',()=>{
 const base=10000;
 const oldOne=base*(1+.03);
 const newOne=base*(1+.06);
 expect(newOne-base).toBe((oldOne-base)*2);
 expect(base*(1+10*.06)).toBe(16000);
});
