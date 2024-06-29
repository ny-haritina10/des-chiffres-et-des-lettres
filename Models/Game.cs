public class Game
{
    private Random random;

    public Game()
    {
        random = new Random();
    }

    public int GenerateRandomNumber(int minValue, int maxValue)
    {
        return random.Next(minValue, maxValue);
    }

    public List<int> GenerateRandomNumberList(int minValue, int maxValue, int count)
    {
        List<int> randomNumbers = new List<int>();
        for (int i = 0; i < count; i++)
        {
            randomNumbers.Add(GenerateRandomNumber(minValue, maxValue));
        }
        return randomNumbers;
        //return new List<int> { 11, 45, 45, 45, 123, 12 };
    }

    public bool IsCombinationValid(string combination, List<int> randomNumberList)
    {
        try
        {
            // extract numbers from combination
            var numbers = System.Text.RegularExpressions.Regex.Matches(combination, @"\d+").Select(m => int.Parse(m.Value)).ToList();

            // count occurences of each numbers in the random list
            var numberCounts = randomNumberList.GroupBy(x => x).ToDictionary(g => g.Key, g => g.Count());

            // verify if all numbers are valid
            foreach (var number in numbers)
            {
                if (!numberCounts.ContainsKey(number) || --numberCounts[number] < 0)
                {
                    return false;
                }
            }

            // evaluate expression
            var result = (int)new System.Data.DataTable().Compute(combination, null);
            return result == int.Parse(combination);
        }
        catch
        {
            return false;
        }
    }

    public int GenerateAINumber(int targetNumber, List<int> randomNumberList)
    {
        int closestNumber = randomNumberList[0];
        int minDifference = Math.Abs(targetNumber - closestNumber);

        foreach (var number in randomNumberList)
        {
            int currentDifference = Math.Abs(targetNumber - number);
            if (currentDifference < minDifference)
            {
                minDifference = currentDifference;
                closestNumber = number;
            }
        }

        return closestNumber;
    }


    public string GenerateAICombination(int targetNumber, List<int> randomNumberList)
    {
        // Use dynamic programming to find the closest combination
        int n = randomNumberList.Count;
        var dp = new Dictionary<int, List<int>>();
        dp[0] = new List<int>();

        foreach (var number in randomNumberList)
        {
            var newEntries = new Dictionary<int, List<int>>();
            foreach (var kvp in dp)
            {
                int newSum = kvp.Key + number;
                if (newSum <= targetNumber)
                {
                    var newList = new List<int>(kvp.Value) { number };
                    if (!dp.ContainsKey(newSum) || dp[newSum].Count > newList.Count)
                    {
                        newEntries[newSum] = newList;
                    }
                }
            }
            foreach (var entry in newEntries)
            {
                dp[entry.Key] = entry.Value;
            }
        }

        // Find the sum that is closest to the target number
        int closestSum = dp.Keys.OrderBy(sum => Math.Abs(targetNumber - sum)).FirstOrDefault();
        return string.Join(" + ", dp[closestSum]);
    }
}