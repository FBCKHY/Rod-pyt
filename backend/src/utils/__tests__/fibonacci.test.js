/**
 * 斐波那契函数测试套件
 */

const {
  fibonacci,
  fibonacciRecursive,
  fibonacciIterative,
  fibonacciMemoized,
  fibonacciDP,
  fibonacciSequence,
  fibonacciGenerator
} = require('../fibonacci');

describe('斐波那契函数测试', () => {
  
  // 测试基本功能
  describe('基本功能测试', () => {
    const testCases = [
      { input: 0, expected: 0 },
      { input: 1, expected: 1 },
      { input: 2, expected: 1 },
      { input: 3, expected: 2 },
      { input: 4, expected: 3 },
      { input: 5, expected: 5 },
      { input: 6, expected: 8 },
      { input: 7, expected: 13 },
      { input: 10, expected: 55 },
      { input: 15, expected: 610 },
      { input: 20, expected: 6765 }
    ];

    testCases.forEach(({ input, expected }) => {
      test(`fibonacci(${input}) 应该返回 ${expected}`, () => {
        expect(fibonacci(input)).toBe(expected);
      });
    });
  });

  // 测试所有实现方式的一致性
  describe('不同实现方式一致性测试', () => {
    const implementations = {
      '迭代法': fibonacciIterative,
      '记忆化': fibonacciMemoized,
      '动态规划': fibonacciDP
    };

    Object.entries(implementations).forEach(([name, func]) => {
      test(`${name} 应该与标准结果一致`, () => {
        expect(func(10)).toBe(55);
        expect(func(15)).toBe(610);
        expect(func(20)).toBe(6765);
      });
    });
  });

  // 测试递归实现（小数值）
  describe('递归实现测试（仅小数值）', () => {
    test('递归法处理小数值应该正确', () => {
      expect(fibonacciRecursive(0)).toBe(0);
      expect(fibonacciRecursive(5)).toBe(5);
      expect(fibonacciRecursive(10)).toBe(55);
    });
  });

  // 测试错误处理
  describe('错误处理测试', () => {
    test('负数输入应该抛出错误', () => {
      expect(() => fibonacci(-1)).toThrow('输入必须是非负整数');
      expect(() => fibonacciIterative(-5)).toThrow('输入必须是非负整数');
    });
  });

  // 测试数列生成
  describe('数列生成测试', () => {
    test('生成前10个斐波那契数', () => {
      const sequence = fibonacciSequence(10);
      expect(sequence).toEqual([0, 1, 1, 2, 3, 5, 8, 13, 21, 34]);
    });

    test('生成空数列', () => {
      expect(fibonacciSequence(0)).toEqual([]);
    });

    test('生成单个元素', () => {
      expect(fibonacciSequence(1)).toEqual([0]);
    });
  });

  // 测试生成器
  describe('生成器测试', () => {
    test('生成器应该逐个产生斐波那契数', () => {
      const gen = fibonacciGenerator(5);
      const result = Array.from(gen);
      expect(result).toEqual([0, 1, 1, 2, 3]);
    });

    test('生成器可以用于大数列而不占用大量内存', () => {
      const gen = fibonacciGenerator(100);
      let count = 0;
      for (const num of gen) {
        count++;
        if (count === 10) break;
      }
      expect(count).toBe(10);
    });
  });

  // 性能比较测试（仅记录，不做断言）
  describe('性能测试（信息性）', () => {
    const n = 30;

    test('迭代法性能测试', () => {
      const start = Date.now();
      fibonacciIterative(n);
      const duration = Date.now() - start;
      console.log(`迭代法计算 fib(${n}) 耗时: ${duration}ms`);
      expect(duration).toBeLessThan(100); // 应该很快
    });

    test('记忆化性能测试', () => {
      const start = Date.now();
      fibonacciMemoized(n);
      const duration = Date.now() - start;
      console.log(`记忆化计算 fib(${n}) 耗时: ${duration}ms`);
      expect(duration).toBeLessThan(100);
    });

    test('动态规划性能测试', () => {
      const start = Date.now();
      fibonacciDP(n);
      const duration = Date.now() - start;
      console.log(`动态规划计算 fib(${n}) 耗时: ${duration}ms`);
      expect(duration).toBeLessThan(100);
    });
  });

  // 边界测试
  describe('边界情况测试', () => {
    test('处理0', () => {
      expect(fibonacci(0)).toBe(0);
    });

    test('处理1', () => {
      expect(fibonacci(1)).toBe(1);
    });

    test('处理较大的数值', () => {
      expect(fibonacci(40)).toBe(102334155);
    });
  });
});

