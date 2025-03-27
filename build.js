// 构建脚本：用于生成包含环境变量的文件
const fs = require('fs');

// 从环境变量中读取API密钥
const apiKey = process.env.OPENROUTER_API_KEY || '';

const environmentFileContent = `// 这个文件是自动生成的，请勿手动修改
// 生成时间: ${new Date().toISOString()}
window.ENV_OPENROUTER_API_KEY = '${apiKey}';
`;

// 写入环境变量文件
fs.writeFileSync('environment.js', environmentFileContent);
console.log('✅ 环境变量文件 (environment.js) 已成功生成!');

// 如果API密钥为空，显示警告
if (!apiKey) {
  console.warn('⚠️ 警告: OPENROUTER_API_KEY 环境变量未设置，API功能可能无法正常工作。');
} 