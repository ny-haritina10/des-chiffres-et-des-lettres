using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;

namespace game.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GameController : ControllerBase
    {
        private readonly Game game;

        public GameController()
        {
            game = new Game();
        }

        [HttpGet("randomList")]
        public IActionResult RandomList()
        {
            int min = 1;
            int max = 1000;

            int randomNumber = game.GenerateRandomNumber(min, max);
            List<int> randomNumberList = game.GenerateRandomNumberList(1, 100, 7);
            return Ok(new { randomNumber, randomNumberList });
        }

        [HttpPost("evaluateCombination")]
        public IActionResult EvaluateCombination([FromBody] EvaluateCombinationRequest request)
        {
            bool isValid = game.IsCombinationValid(request.Combination, request.RandomNumberList);

            return Ok(new { isValid });
        }
    }

    public class EvaluateCombinationRequest
    {
        public string Combination { get; set; }
        public List<int> RandomNumberList { get; set; }
    }
}