using MongoDB.Driver;
using Toadtris.Backend.Models;

namespace Toadtris.Backend.Services;

public class LeaderboardService
{
    private readonly IMongoCollection<LeaderboardEntry> _collection;

    public LeaderboardService(IConfiguration config)
    {
        var client = new MongoClient(config["MONGODB_URI"]);
        var db = client.GetDatabase("tetrisleaderboard");
        _collection = db.GetCollection<LeaderboardEntry>("scores");
    }

    public async Task<List<LeaderboardEntry>> GetTopAsync(int count = 20) =>
        await _collection.Find(_ => true).SortByDescending(e => e.Score).Limit(count).ToListAsync();

    public async Task<List<LeaderboardEntry>> GetUserTopAsync(string nickname, int count = 3) =>
    await _collection.Find(e => e.Nickname == nickname)
        .SortByDescending(e => e.Score)
        .Limit(count)
        .ToListAsync();

    public async Task AddAsync(LeaderboardEntry entry) =>
        await _collection.InsertOneAsync(entry);
}