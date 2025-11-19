/**
 * 斐波那契函数使用示例
 * 运行方式: node backend/examples/fibonacci-demo.js
 */

const {
  fibonacci,
  fibonacciRecursive,
  fibonacciIterative,
  fibonacciMemoized,
  fibonacciDP,
  fibonacciSequence,
  fibonacciGenerator
} = require('../src/utils/fibonacci');

console.log('=== 斐波那契函数使用示例 ===\n');

// 示例1: 计算单个斐波那契数
console.log('📌 示例1: 计算第10个斐波那契数');
console.log(`fibonacci(10) = ${fibonacci(10)}`);
console.log('');

// 示例2: 比较不同实现方式
console.log('📌 示例2: 不同实现方式的结果（n=15）');
console.log(`递归实现: ${fibonacciRecursive(15)}`);
console.log(`迭代实现: ${fibonacciIterative(15)}`);
console.log(`记忆化实现: ${fibonacciMemoized(15)}`);
console.log(`动态规划实现: ${fibonacciDP(15)}`);
console.log('');

// 示例3: 生成斐波那契数列
console.log('📌 示例3: 生成前15个斐波那契数');
const sequence = fibonacciSequence(15);
console.log(sequence.join(', '));
console.log('');

// 示例4: 使用生成器
console.log('📌 示例4: 使用生成器逐个生成（前10个）');
const gen = fibonacciGenerator(10);
const genResult = [];
for (const num of gen) {
  genResult.push(num);
}
console.log(genResult.join(', '));
console.log('');

// 示例5: 性能对比（较大的数值）
console.log('📌 示例5: 性能对比（n=35）');

console.time('迭代法');
const result1 = fibonacciIterative(35);
console.timeEnd('迭代法');
console.log(`结果: ${result1}`);

console.time('记忆化');
const result2 = fibonacciMemoized(35);
console.timeEnd('记忆化');
console.log(`结果: ${result2}`);

console.time('动态规划');
const result3 = fibonacciDP(35);
console.timeEnd('动态规划');
console.log(`结果: ${result3}`);

console.log('\n⚠️  注意：递归法在大数值时会非常慢，已跳过 n=35 的测试');
console.log('');

// 示例6: 错误处理
console.log('📌 示例6: 错误处理');
try {
  fibonacci(-5);
} catch (error) {
  console.log(`捕获错误: ${error.message}`);
}
console.log('');

// 示例7: 实际应用场景
console.log('📌 示例7: 实际应用场景 - 计算前N个数的和');
function sumFirstNFibonacci(n) {
  const sequence = fibonacciSequence(n);
  return sequence.reduce((sum, num) => sum + num, 0);
}
console.log(`前10个斐波那契数的和: ${sumFirstNFibonacci(10)}`);
console.log('');

// 示例8: 查找小于某个值的所有斐波那契数
console.log('📌 示例8: 查找小于1000的所有斐波那契数');
function fibonacciLessThan(max) {
  const result = [];
  let i = 0;
  while (true) {
    const fib = fibonacci(i);
    if (fib >= max) break;
    result.push(fib);
    i++;
  }
  return result;
}
const lessThan1000 = fibonacciLessThan(1000);
console.log(`共 ${lessThan1000.length} 个数:`);
console.log(lessThan1000.join(', '));
console.log('');

console.log('=== 演示完成 ===');

