import { useEffect, useState } from "react";

type Entry = {
  nickname: string;
  score: number;
};

export default function Leaderboard({ userNickname }: { userNickname?: string }) {
  const [top, setTop] = useState<Entry[]>([]);
  const [userTop, setUserTop] = useState<Entry[]>([]);

  useEffect(() => {
    fetch("/api/leaderboard/top?count=10")
      .then(res => res.json())
      .then(setTop);

    if (userNickname) {
      fetch(`/api/leaderboard/user?nickname=${encodeURIComponent(userNickname)}&count=3`)
        .then(res => res.json())
        .then(setUserTop);
    }
  }, [userNickname]);

  return (
    <div>
      <h2>Leaderboard</h2>
      <ol>
        {top.map((e, i) => (
          <li key={i}>{e.nickname}: {e.score}</li>
        ))}
      </ol>
      {userNickname && userTop.length > 0 && (
        <>
          <h3>Twoje TOP 3</h3>
          <ol>
            {userTop.map((e, i) => (
              <li key={i}>{e.score}</li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}