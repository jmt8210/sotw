import Image from "next/image";
import * as _ from "lodash";

type WinsItem = {
  squad: string;
  wins: number;
};

type CFBAPIResponse = {
  // This has more fields, add as needed
  home_team: string;
  away_team: string;
  home_points: number;
  away_points: number;
  week: number;
};

const squads = [
  "Tubas",
  "Trumpets",
  "KAOS",
  "Percussion",
  "Guard",
  "Piccs",
  "Clarinets",
  "Saxes",
];

// Array containing the squad who won for each week
// Empty for no-squad-of-the-week weeks (E.g. away games (minus travel game))
const squad_wins: string[] = ["KAOS"];

async function getWins() {
  // Could call out to route here (if hooking up to db or something similar)
  // return await fetch('http://localhost:3000/api/wins').then(res => res.json());

  const wins = _.countBy(squad_wins);
  const data = squads.map((i) => ({ squad: i, wins: wins[i] ?? 0 }));

  return data;
}

async function getGames() {
  const data = await fetch(
    "https://api.collegefootballdata.com/games?year=2023&seasonType=regular&team=maryland",
    { headers: { Authorization: `Bearer ${process.env.CFB_DATA_TOKEN}` } },
  ).then((res) => res.json());
  return data;
}

function replaceSpaces(text: string) {
  return text.replace(" ", "_");
}

export default async function Home() {
  const wins: WinsItem[] = await getWins();
  const games = await getGames();

  wins.sort((a, b) => ("" + a.squad).localeCompare(b.squad));
  if (!wins) return <div></div>;

  return (
    <div className="flex flex-col bg-maryland-band bg-center min-h-screen items-center justify-center py-4">
      <div className="relative bg-slate-200 rounded-xl overflow-auto mb-4">
        {/* Title */}
        <h1 className="dark:border-slate-600 font-medium p-4 text-slate-600 dark:text-slate-600 text-left">
          MSOM Squad of the Week 2023 Wins
        </h1>
      </div>
      <div className="relative bg-slate-200 rounded-xl overflow-auto w-3/4">
        {/* Wins */}
        <div className="shadow-sm overflow-hidden overflow-x-scroll my-8">
          <table className="border-collapse table-auto w-full text-sm">
            <thead>
              <tr>
                <th className="header-cell">Squad</th>
                <th className="header-cell">Wins</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800">
              <>
                {wins.map((item: WinsItem) => (
                  <tr key={item.squad}>
                    <td className="data-cell">{item.squad}</td>
                    <td className="data-cell">{item.wins}</td>
                  </tr>
                ))}
              </>
            </tbody>
          </table>
        </div>
      </div>

      <>
        {games !== undefined && (
          <div className="relative bg-slate-200 rounded-xl overflow-auto w-3/4 mt-4">
            {/* Games */}
            <div className="shadow-sm overflow-hidden overflow-x-scroll my-8">
              <table className="border-collapse table-auto w-full text-sm">
                <thead>
                  <tr>
                    <th className="header-cell">Home</th>
                    <th className="header-cell">Away</th>
                    <th className="header-cell">Home Score</th>
                    <th className="header-cell">Away Score</th>
                    <th className="header-cell">Squad of the Week</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800">
                  <>
                    {games.map((game: CFBAPIResponse) => (
                      <tr key={game.home_team + game.week}>
                        <td className="data-cell">
                          <div className="flex flex-row gap-2 items-center">
                            <Image
                              src={`./logos/${replaceSpaces(
                                game.home_team,
                              )}.svg`}
                              alt={`${game.home_team} logo`}
                              width={24}
                              height={24}
                            />
                            {game.home_team}
                          </div>
                        </td>
                        <td className="data-cell">
                          <div className="flex flex-row gap-2 items-center">
                            <Image
                              src={`./logos/${replaceSpaces(
                                game.away_team,
                              )}.svg`}
                              alt={`${game.away_team} logo`}
                              width={24}
                              height={24}
                            />
                            {game.away_team}
                          </div>
                        </td>
                        <td className="data-cell">
                          {game.home_points ?? "N/A"}
                        </td>
                        <td className="data-cell">
                          {game.away_points ?? "N/A"}
                        </td>
                        <td className="data-cell">
                          {game.away_team === "Maryland"
                            ? "-"
                            : squad_wins[game.week - 1] ?? ""}
                        </td>
                      </tr>
                    ))}
                  </>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </>
    </div>
  );
}
