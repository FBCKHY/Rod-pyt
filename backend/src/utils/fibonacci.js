/**
 * 斐波那契数列计算工具函数
 * 提供多种实现方式：递归、迭代、动态规划、记忆化
 */

/**
 * 方法1: 基础递归实现（简单但效率低）
 * 时间复杂度: O(2^n)
 * 空间复杂度: O(n)
 * @param {number} n - 第n个斐波那契数
 * @returns {number} 斐波那契数
 */
function fibonacciRecursive(n) {
  if (n < 0) {
    throw new Error('输入必须是非负整数');
  }
  if (n <= 1) {
    return n;
  }
  return fibonacciRecursive(n - 1) + fibonacciRecursive(n - 2);
}

/**
 * 方法2: 迭代实现（推荐用于中等规模）
 * 时间复杂度: O(n)
 * 空间复杂度: O(1)
 * @param {number} n - 第n个斐波那契数
 * @returns {number} 斐波那契数
 */
function fibonacciIterative(n) {
  if (n < 0) {
    throw new Error('输入必须是非负整数');
  }
  if (n <= 1) {
    return n;
  }
  
  let prev = 0;
  let curr = 1;
  
  for (let i = 2; i <= n; i++) {
    const next = prev + curr;
    prev = curr;
    curr = next;
  }
  
  return curr;
}

/**
 * 方法3: 记忆化递归（结合递归和缓存）
 * 时间复杂度: O(n)
 * 空间复杂度: O(n)
 * @param {number} n - 第n个斐波那契数
 * @param {Map} memo - 缓存对象
 * @returns {number} 斐波那契数
 */
function fibonacciMemoized(n, memo = new Map()) {
  if (n < 0) {
    throw new Error('输入必须是非负整数');
  }
  if (n <= 1) {
    return n;
  }
  
  if (memo.has(n)) {
    return memo.get(n);
  }
  
  const result = fibonacciMemoized(n - 1, memo) + fibonacciMemoized(n - 2, memo);
  memo.set(n, result);
  
  return result;
}

/**
 * 方法4: 动态规划（最优解）
 * 时间复杂度: O(n)
 * 空间复杂度: O(n)
 * @param {number} n - 第n个斐波那契数
 * @returns {number} 斐波那契数
 */
function fibonacciDP(n) {
  if (n < 0) {
    throw new Error('输入必须是非负整数');
  }
  if (n <= 1) {
    return n;
  }
  
  const dp = new Array(n + 1);
  dp[0] = 0;
  dp[1] = 1;
  
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  
  return dp[n];
}

/**
 * 方法5: 生成斐波那契数列（返回数组）
 * @param {number} count - 生成数列的长度
 * @returns {number[]} 斐波那契数列数组
 */
function fibonacciSequence(count) {
  if (count < 0) {
    throw new Error('输入必须是非负整数');
  }
  if (count === 0) {
    return [];
  }
  if (count === 1) {
    return [0];
  }
  
  const sequence = [0, 1];
  
  for (let i = 2; i < count; i++) {
    sequence.push(sequence[i - 1] + sequence[i - 2]);
  }
  
  return sequence;
}

/**
 * 方法6: 使用生成器（内存高效）
 * @param {number} count - 生成数列的长度
 * @yields {number} 下一个斐波那契数
 */
function* fibonacciGenerator(count) {
  if (count < 0) {
    throw new Error('输入必须是非负整数');
  }
  
  let prev = 0;
  let curr = 1;
  let generated = 0;
  
  while (generated < count) {
    yield prev;
    [prev, curr] = [curr, prev + curr];
    generated++;
  }
}

/**
 * 推荐的默认实现（迭代法）
 */
function fibonacci(n) {
  return fibonacciIterative(n);
}

module.exports = {
  fibonacci,                    // 默认推荐
  fibonacciRecursive,          // 递归
  fibonacciIterative,          // 迭代
  fibonacciMemoized,           // 记忆化
  fibonacciDP,                 // 动态规划
  fibonacciSequence,           // 生成数列
  fibonacciGenerator           // 生成器
};

