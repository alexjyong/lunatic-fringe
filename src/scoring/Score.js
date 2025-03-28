export class Score {
  /**
   * @param {string} username
   * @param {number} level
   * @param {number} score
   */
  constructor(username, level, score) {
    this.username = username;
    this.level = level;
    this.score = score;
  }

  toJSON() {
    return {
      username: this.username,
      level: this.level,
      score: this.score,
    };
  }
}
