import { EqualShares } from "./EqualShares";

describe("Method of Equal Shares Tests", () => {
  test("Basic Example", () => {
    const candidates = ["Allison", "Bill", "Carmen", "Doug"];
    const votes = [
      [0, 5, 0, 0],
      [5, 5, 0, 0],
      [5, 5, 0, 0],
      [5, 5, 0, 0],
      [5, 5, 5, 5],
      [0, 0, 0, 5],
      [0, 0, 5, 5],
      [0, 0, 5, 5],
      [0, 0, 5, 5],
      [0, 0, 5, 5],
    ];
    const results = EqualShares(candidates, votes, 2, []);
    expect(results.elected.length).toBe(2);
    expect(["Doug"]).toEqual(expect.arrayContaining([results.elected[0].name]));
    expect(["Bill"]).toEqual(expect.arrayContaining([results.elected[1].name]));
  });

  test("Basic Example 2", () => {
    const candidates = ["Allison", "Bill", "Carmen", "Doug"];
    const votes = [
      [0, 1, 1, 1],
      [1, 1, 1, 1],
      [1, 0, 1, 1],
      [1, 1, 0, 0],
      [1, 1, 1, 1],
      [0, 1, 1, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
      [1, 1, 1, 0],
      [0, 1, 0, 0],
      [0, 1, 1, 0],
      [0, 1, 1, 0],
      [0, 1, 0, 1],
      [0, 0, 1, 0],
      [1, 1, 1, 0],
      [1, 1, 0, 1],
      [0, 1, 0, 1],
      [0, 1, 1, 1],
    ];
    const results = EqualShares(candidates, votes, 2, []);
    expect(results.elected.length).toBe(2);
    expect(results.elected[0].name).toBe("Bill");
    expect(results.elected[1].name).toBe("Carmen");
  });

  test("'PAV compared to Phragmén-style rules' Example", () => {
    // https://pref.tools/abcvoting/
    //  PAV compared to Phragmén-style rules (shown at startup)
    // Peters and Skowron, 2020, "Proportionality and the Limits of Welfarism", Introduction

    const candidates = [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "12",
      "13",
      "14"
    ];

    // 111100000000000
    // 111010000000000
    // 111001000000000
    // 000001111000000
    // 000000000111000
    // 000000000000111

    const votes = [
      // 0,1,2,3,4,5,6,7,8,9,10
      [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],

    ];
    const results = EqualShares(candidates, votes, 12, [], false, 'seqphragmen');
    //  {0, 1, 10, 12, 13, 2, 3, 4, 5, 6, 7, 9}

    console.log(results.summaryData)
    console.log(results.elected)
    console.log(...results.roundResults)
    expect(results.elected.length).toBe(12);
    expect(results.elected[0].name).toBe("0"); // 0 should win first
    expect(results.elected[1].name).toBe("1"); // 1 should win second
    expect(results.elected[2].name).toBe("10");
    expect(results.elected[3].name).toBe("12");
    expect(results.elected[4].name).toBe("13");
    expect(results.elected[5].name).toBe("2");
    expect(results.elected[6].name).toBe("3");
    expect(results.elected[7].name).toBe("4");
    expect(results.elected[8].name).toBe("5");
    expect(results.elected[9].name).toBe("6");
    expect(results.elected[10].name).toBe("7");
    expect(results.elected[11].name).toBe("9");

    // Verify that the correct candidates were not elected
    expect(results.elected.map(c => c.name)).not.toContain("8");
    expect(results.elected.map(c => c.name)).not.toContain("11");
    expect(results.elected.map(c => c.name)).not.toContain("14");
  });

  test("'PAV compared to Phragmén-style rules' Example", () => {
    // https://pref.tools/abcvoting/
    //  PAV compared to Phragmén-style rules (shown at startup)
    // Peters and Skowron, 2020, "Proportionality and the Limits of Welfarism", Introduction

    const candidates = [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "12",
      "13",
      "14"
    ];

    // 111100000000000
    // 111010000000000
    // 111001000000000
    // 000001111000000
    // 000000000111000
    // 000000000000111

    const votes = [
      // 0,1,2,3,4,5,6,7,8,9,10
      [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],

    ];
    const results = EqualShares(candidates, votes, 12, [], false, 'av');
    // {0, 1, 10, 11, 12, 13, 2, 3, 4, 5, 6, 9}
    // console.log(results.summaryData)
    // console.log(results.elected)
    // console.log(...results.roundResults)
    // expect(results.elected.length).toBe(12);
    // expect(results.elected[0].name).toBe("0"); // 0 should win first
    // expect(results.elected[1].name).toBe("1"); // 10 should win second
    // expect(results.elected[2].name).toBe("10");
    // expect(results.elected[3].name).toBe("11");
    // expect(results.elected[4].name).toBe("12");
    // expect(results.elected[5].name).toBe("13");
    // expect(results.elected[6].name).toBe("2");
    // expect(results.elected[7].name).toBe("3");
    // expect(results.elected[8].name).toBe("4");
    // expect(results.elected[9].name).toBe("5");
    // expect(results.elected[10].name).toBe("6");
    // expect(results.elected[11].name).toBe("9");
  });


  test("Random Tiebreaker", () => {
    const candidates = ["Allison", "Bill", "Carmen", "Doug"];
    const votes = [
      [5, 5, 1, 0],
      [5, 5, 1, 0],
      [5, 5, 1, 0],
      [5, 5, 1, 0],
      [5, 5, 4, 0],
      [0, 0, 0, 3],
      [0, 0, 4, 5],
      [0, 0, 4, 5],
      [0, 0, 4, 5],
      [0, 0, 4, 5],
    ];
    const results = EqualShares(candidates, votes, 2, []);
    expect(results.elected.length).toBe(2);
    expect(results.elected[0].name).toBe("Carmen"); // random tiebreaker, second place lower index 1
    expect(results.elected[1].name).toBe("Allison");
  });

  test("Random Tiebreaker with Defined Order", () => {
    const candidates = ["Allison", "Bill", "Carmen", "Doug"];
    const votes = [
      [5, 5, 1, 0],
      [5, 5, 1, 0],
      [5, 5, 1, 0],
      [5, 5, 1, 0],
      [5, 5, 4, 0],
      [0, 0, 0, 3],
      [0, 0, 4, 5],
      [0, 0, 4, 5],
      [0, 0, 4, 5],
      [0, 0, 4, 5],
    ];
    const results = EqualShares(candidates, votes, 2, [3, 2, 1, 0]);
    expect(results.elected.length).toBe(2);
    expect(results.elected[0].name).toBe("Carmen"); // random tiebreaker, second place lower index 1
    expect(results.elected[1].name).toBe("Bill");
  });

  test("Valid/Invalid/Under/Bullet Vote Counts", () => {
    const candidates = ["Allison", "Bill", "Carmen"];
    const votes = [
      [1, 3, 5],
      [1, 3, 5],
      [1, 3, 5],
      [0, 0, 0],
      [0, 0, 0],
      [-1, 3, 5],
      [0, 3, 6],
      [5, 0, 0],
      [0, 5, 0],
      [0, 0, 5],
    ];
    const results = EqualShares(candidates, votes, 1, []);
    expect(results.summaryData.nValidVotes).toBe(8);
    expect(results.summaryData.nInvalidVotes).toBe(2);
    expect(results.summaryData.nUnderVotes).toBe(2);
    expect(results.summaryData.nBulletVotes).toBe(0);
  });
});