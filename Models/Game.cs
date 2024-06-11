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

        return new List<int> { 11, 45, 45, 45, 123, 12 };
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
}