const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\Administrator\\.gemini\\antigravity\\brain\\b865263f-1fec-421b-832e-a15a89982776';
const destDir = 'd:\\한성주\\shoppotofolio\\org';

const mapping = {
  'avatar_3d_dog_pomeranian': 'avatar_3d_dog_pomeranian.png',
  'avatar_3d_dog_maltese': 'avatar_3d_dog_maltese.png',
  'avatar_3d_dog_poodle': 'avatar_3d_dog_poodle.png',
  'avatar_3d_dog_welsh_corgi': 'avatar_3d_dog_welsh_corgi.png',
  'avatar_3d_dog_bichon_frise': 'avatar_3d_dog_bichon_frise.png',
  'avatar_3d_dog_golden_retriever': 'avatar_3d_dog_golden_retriever.png',
  'avatar_3d_cat_korean_short_hair': 'avatar_3d_cat_korean.png',
  'avatar_3d_cat_russian_blue': 'avatar_3d_cat_russian_blue.png',
  'avatar_3d_cat_persian': 'avatar_3d_cat_persian.png',
  'avatar_3d_cat_british_shorthair': 'avatar_3d_cat_british.png',
  'avatar_3d_cat_scottish_fold': 'avatar_3d_cat_scottish_fold.png'
};

const files = fs.readdirSync(srcDir);
files.forEach(file => {
  for (const [key, destName] of Object.entries(mapping)) {
    if (file.startsWith(key) && file.endsWith('.png')) {
      const srcPath = path.join(srcDir, file);
      const destPath = path.join(destDir, destName);
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied ${file} -> ${destName}`);
    }
  }
});
console.log('Done copying!');
