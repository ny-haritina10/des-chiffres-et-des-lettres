using System;
using System.Collections.Generic;
using System.Data;

public class IA
{
    private List<(int value, string expression)> closestValues;
    private List<int> numbers;
    private int target;

    public IA(List<int> numbers, int target)
    {
        this.numbers = numbers;
        this.target = target;

        closestValues = new List<(int, string)>();
    }

    public void evaluate()
    {
        evaluate(0, 0, "");
        
        // Sort closestValues by the absolute difference to target
        closestValues.Sort((x, y) => Math.Abs(target - x.value).CompareTo(Math.Abs(target - y.value)));

        // Check if at least one of the closest values is exactly equal to target
        bool foundExactTarget = false;
        for (int i = 0; i < Math.Min(3, closestValues.Count); i++)
        {
            if (closestValues[i].value == target)
            {
                foundExactTarget = true;
                break;
            }
        }

        // If no exact target found among the closest 3 values, replace with closest unique values
        if (!foundExactTarget && closestValues.Count >= 3)
        {
            // Remove duplicates from closestValues (if any)
            closestValues = closestValues.Distinct().ToList();

            // Keep only the closest 3 unique values
            if (closestValues.Count > 3)
            {
                closestValues = closestValues.OrderBy(x => Math.Abs(target - x.value)).Take(3).ToList();
            }
        }
    }

    private void evaluate(int index, int total, string expression)
    {
        if (index == numbers.Count)
        {
            int result = EvaluateExpression(expression);
            int difference = Math.Abs(target - result);

            // Add the current evaluation result to closestValues if it's closer than the 3rd closest currently stored
            if (closestValues.Count < 3 || difference < Math.Abs(target - closestValues[2].value))
            {
                closestValues.Add((result, expression));
                
                // Sort closestValues again after adding a new value
                closestValues.Sort((x, y) => Math.Abs(target - x.value).CompareTo(Math.Abs(target - y.value)));
                
                // Keep only the closest 3 values
                if (closestValues.Count > 3)
                {
                    closestValues = closestValues.GetRange(0, 3);
                }
            }

            return;
        }

        int next = numbers[index];

        evaluate(index + 1, total, expression);
        evaluate(index + 1, total + next, $"{expression} + {next}");
        evaluate(index + 1, total - next, $"{expression} - {next}");
        evaluate(index + 1, total * next, $"({expression}) * {next}");
        
        if (next != 0)
        {
            evaluate(index + 1, total / next, $"({expression}) / {next}");
        }
    }

    private int EvaluateExpression(string expression)
    {
        try
        {
            var table = new DataTable();
            var result = table.Compute(expression, string.Empty);
            return Convert.ToInt32(result);
        }
        catch
        {
            return int.MaxValue; // Return a large number to signify an invalid expression
        }
    }

    public List<(int value, string expression)> getClosestValues()
    {
        return closestValues;
    }
}