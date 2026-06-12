const fs = require('fs');
fs.copyFileSync(
  'C:\\Users\\Administrator\\.gemini\\antigravity\\brain\\8bc15c20-5eeb-4311-b911-646967934f7f\\avatar_3d_dog_1781231982501.png',
  'd:\\한성주\\shoppotofolio\\org\\avatar_3d_dog.png'
);
fs.copyFileSync(
  'C:\\Users\\Administrator\\.gemini\\antigravity\\brain\\8bc15c20-5eeb-4311-b911-646967934f7f\\avatar_3d_cat_1781231997402.png',
  'd:\\한성주\\shoppotofolio\\org\\avatar_3d_cat.png'
);
console.log('Successfully copied 3D avatar images!');
