"use strict";

Object.defineProperty(exports, '__esModule', { value: true });

class CardModel {
  constructor(db) {
    this.db = db;
  }

  findAll() {
    return new Promise((resolve, reject) => {
      this.db.find({}, (err, docs) => {
        if (err) {
          reject(err);
        } else {
          resolve(docs);
        }
      });
    });
  }

  addTask(cardId, newTask) {
    return new Promise((resolve, reject) => {
      this.db.findOne({ id: cardId }, (err, doc) => {
        if (err) {
          reject(err);
        }
        doc.tasks.push(newTask);
        this.updateTask(cardId, doc, newTask).then(resolve).catch(reject);
      });
    });
  }

  deleteTask(cardId, taskId) {
    return new Promise((resolve, reject) => {
      this.db.findOne({ id: cardId }, (err, doc) => {
        if (err) {
          reject(err);
        } else {
          const taskIndex = doc.tasks.findIndex((task) => task.id === taskId);
          const removedTask = doc.tasks.splice(taskIndex, 1);
          this.updateTask(cardId, doc, removedTask[0]);
        }
      });
    });
  }

  updateTask(cardId, card, task) {
    return new Promise((resolve, reject) => {
      this.db.update({ id: cardId }, { $set: card }, {}, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(task);
        }
      });
    });
  }

  updateTaskStatus(cardId, taskId, status) {
    return new Promise((resolve, reject) => {
      this.db.findOne({ id: cardId }, (err, doc) => {
        if (err) {
          reject(err);
        } else {
          const currentTask = doc.tasks.find((task) => task.id === taskId);
          currentTask.done = status;
          this.updateTask(cardId, doc, currentTask);
        }
      });
    });
  }

  updateCard(cardId, card) {
    return new Promise((resolve, reject) => {
      this.db.update({ id: cardId }, { $set: card }, {}, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(card);
        }
      });
    });
  }

  addCard(card) {
    return new Promise((resolve, reject) => {
      this.db.insert(card, (err, newDoc) => {
        if (err) {
          reject(err);
        } else {
          resolve(newDoc);
        }
      });
    });
  }
}

exports.default = CardModel;
