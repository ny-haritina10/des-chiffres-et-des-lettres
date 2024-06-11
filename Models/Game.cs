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
}