namespace Toadtris.Backend.Models;

public class LeaderboardEntry
{
    public string Id { get; set; } = null!;
    public string Nickname { get; set; } = null!;
    public string? UserId { get; set; } // null for anonymous
    public int Score { get; set; }
    public DateTime Date { get; set; }
}