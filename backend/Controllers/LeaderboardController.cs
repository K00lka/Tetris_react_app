using Microsoft.AspNetCore.Mvc;
using Toadtris.Backend.Models;
using Toadtris.Backend.Services;

[ApiController]
[Route("api/[controller]")]
public class LeaderboardController : ControllerBase
{
    private readonly LeaderboardService _service;

    public LeaderboardController(LeaderboardService service)
    {
        _service = service;
    }

    [HttpGet("top")]
    public async Task<IActionResult> GetTop()
        => Ok(await _service.GetTopAsync());

    [HttpPost]
    public async Task<IActionResult> Add([FromBody] LeaderboardEntry entry)
    {
        entry.Date = DateTime.UtcNow;
        await _service.AddAsync(entry);
        return Ok();
    }
    [HttpGet("user")]
    public async Task<IActionResult> GetUserTop([FromQuery] string nickname, [FromQuery] int count = 3)
        => Ok(await _service.GetUserTopAsync(nickname, count));
}