using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
client.connect();

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add Entity Framework Core with SQLite
builder.Services.AddDbContext<TetrisDbContext>(options =>
    options.UseSqlite("Data Source=tetris_scores.db"));

// Add CORS policy for React frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Apply database migrations on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<TetrisDbContext>();
    db.Database.EnsureCreated();
}

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowReactApp");
app.UseAuthorization();

app.MapControllers();

// Root endpoint with API information
app.MapGet("/", () => Results.Ok(new 
{ 
    message = "Tetris Game API",
    version = "1.0.0",
    status = "running",
    endpoints = new
    {
        health = "/health",
        leaderboard = "/api/leaderboard",
        leaderboardTop = "/api/leaderboard/top/{count}",
        submitScore = "POST /api/leaderboard",
        playerStats = "/api/players/{playerName}/scores",
        gameConfig = "/api/game/config",
        swagger = "/swagger/index.html"
    }
}))
    .WithName("Root")
    .WithOpenApi();

// Health check endpoint
app.MapGet("/health", () => Results.Ok(new { status = "healthy" }))
    .WithName("HealthCheck")
    .WithOpenApi();

// Tetris API endpoints
app.MapGet("/api/leaderboard", GetLeaderboard)
    .WithName("GetLeaderboard")
    .WithOpenApi();

app.MapGet("/api/leaderboard/top/{count}", GetTopScores)
    .WithName("GetTopScores")
    .WithOpenApi();

app.MapPost("/api/leaderboard", SaveScore)
    .WithName("SaveScore")
    .WithOpenApi();

app.MapGet("/api/players/{playerName}/scores", GetPlayerScores)
    .WithName("GetPlayerScores")
    .WithOpenApi();

app.MapGet("/api/game/config", GetGameConfig)
    .WithName("GetGameConfig")
    .WithOpenApi();

app.Run();

// Endpoint handlers
async Task<IResult> GetLeaderboard(TetrisDbContext db)
{
    var leaderboard = await db.Scores
        .OrderByDescending(s => s.Score)
        .Take(10)
        .ToListAsync();

    var result = leaderboard
        .Select((s, index) => new 
        { 
            rank = index + 1,
            playerName = s.PlayerName,
            score = s.Score,
            createdAt = s.CreatedAt
        })
        .ToList();

    return Results.Ok(result);
}

async Task<IResult> GetTopScores(TetrisDbContext db, int count)
{
    if (count <= 0 || count > 100)
        count = 10;

    var topScores = await db.Scores
        .OrderByDescending(s => s.Score)
        .Take(count)
        .ToListAsync();

    var result = topScores
        .Select((s, index) => new 
        { 
            rank = index + 1,
            playerName = s.PlayerName,
            score = s.Score,
            createdAt = s.CreatedAt
        })
        .ToList();

    return Results.Ok(result);
}

async Task<IResult> SaveScore(TetrisDbContext db, ScoreEntry scoreEntry)
{
    if (string.IsNullOrWhiteSpace(scoreEntry.PlayerName) || scoreEntry.Score < 0)
    {
        return Results.BadRequest(new { error = "Invalid player name or score" });
    }

    if (scoreEntry.PlayerName.Length > 50)
    {
        return Results.BadRequest(new { error = "Player name too long (max 50 characters)" });
    }

    var newScore = new ScoreEntry
    {
        Id = Guid.NewGuid(),
        PlayerName = scoreEntry.PlayerName.Trim(),
        Score = scoreEntry.Score,
        CreatedAt = DateTime.UtcNow
    };

    db.Scores.Add(newScore);
    await db.SaveChangesAsync();

    return Results.Created($"/api/leaderboard/{newScore.Id}", new 
    { 
        message = "Score saved successfully",
        id = newScore.Id,
        score = newScore.Score,
        playerName = newScore.PlayerName
    });
}

async Task<IResult> GetPlayerScores(TetrisDbContext db, string playerName)
{
    if (string.IsNullOrWhiteSpace(playerName))
        return Results.BadRequest(new { error = "Player name required" });

    var scores = await db.Scores
        .Where(s => s.PlayerName.ToLower() == playerName.ToLower())
        .OrderByDescending(s => s.CreatedAt)
        .Select(s => new 
        { 
            id = s.Id,
            score = s.Score,
            createdAt = s.CreatedAt
        })
        .ToListAsync();

    if (scores.Count == 0)
        return Results.NotFound(new { message = $"No scores found for player '{playerName}'" });

    var stats = new
    {
        playerName = playerName,
        totalGames = scores.Count,
        bestScore = scores.Max(s => s.score),
        averageScore = (int)scores.Average(s => s.score),
        scores = scores
    };

    return Results.Ok(stats);
}

async Task<IResult> GetGameConfig()
{
    var config = new
    {
        boardWidth = 10,
        boardHeight = 20,
        gridSize = 30,
        initialSpeed = 500,
        maxSpeed = 100
    };
    return Results.Ok(config);
}

// Database Context
public class TetrisDbContext : DbContext
{
    public TetrisDbContext(DbContextOptions<TetrisDbContext> options) : base(options) { }

    public DbSet<ScoreEntry> Scores => Set<ScoreEntry>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<ScoreEntry>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.PlayerName).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Score).IsRequired();
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.HasIndex(e => e.PlayerName);
            entity.HasIndex(e => e.Score);
            entity.HasIndex(e => e.CreatedAt);
        });
    }
}

// Model classes
public class ScoreEntry
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string PlayerName { get; set; } = string.Empty;
    public int Score { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}