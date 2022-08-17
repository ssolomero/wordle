import { Component, OnInit, ViewChild, ElementRef, ViewChildren } from '@angular/core';
import {WORDLES} from './wordle.config';
import * as delay from 'delay';

@Component({
  selector: 'app-wordle',
  templateUrl: './wordle.component.html',
  styleUrls: ['./wordle.component.scss']
})

export class WordleComponent implements OnInit {

  @ViewChild('popup') popup!: ElementRef;
  @ViewChild('snackbar') snackbar!: ElementRef;

  numOfLetters: number = 5; //letter word
  numOfGuesses: number = 6; //amount of tries
  numOfAttempts: number = 0; //attempts taken
  wordleIndex: number = Math.floor(Math.random()*WORDLES.length);
  wordle:string = WORDLES[this.wordleIndex];
  // wordle:string = 'FLEET';

  wordleArr: string[] = [...this.wordle];
  guessArr: string[] = [];
  guessesStr: string = 'ocWordle #'+this.wordleIndex;

  toast: string = 'end game';
  endGame: boolean = false;

  constructor() { }

  ngOnInit(): void {
    this.numOfAttempts = 0;
  }

  async onGuess(){

    let numCorrect = 0;
    let inputs = document.getElementsByClassName('attempt-row-'+this.numOfAttempts);
    let statesArr = []; //value, state
    let guessedWord = '' 
    this.guessesStr += '\n'; //String to share

    // Compare guess to wordle and set states
    for (let i = 0; i < this.numOfLetters; i++) {
      let guess = inputs[i] as HTMLInputElement;
      if (guess.value == this.wordleArr[i]) {
        numCorrect++;
        statesArr.push({value: guess.value, state: 'correct'});
        if (numCorrect == this.numOfLetters) {
          this.numOfAttempts++;
          this.onEndGame();
        }
      } else if (this.wordleArr.includes(guess.value)) {
        statesArr.push({value: guess.value, state: 'close'});
      } else {
        statesArr.push({value: guess.value, state: 'wrong'});
      }
      guessedWord += guess.value;
    }

    // Update states based on duplicates
    this.checkForDuplicates(statesArr, guessedWord);

    // Set css 
    for (let i = 0; i < this.numOfLetters; i++) {
      let guess = inputs[i] as HTMLInputElement;
      guess.classList.add(statesArr[i].state);
      switch(statesArr[i].state) { 
        case 'correct': { 
          this.guessesStr += '🟦 ';
           break; 
        } 
        case 'close': { 
          this.guessesStr += '🟧 ';
           break; 
        } 
        default: { 
          this.guessesStr += '⬜ ';
           break; 
        } 
     } 
     guess.classList.add('filled');
     await delay(350);
    }

    // Focus on next row after guessing
    if (this.numOfAttempts < this.numOfGuesses) {
      let nextInput = document.getElementsByClassName('attempt-row-'+(this.numOfAttempts+1))[0] as HTMLInputElement;
      let currentInput = document.getElementsByClassName('attempt-row-'+this.numOfAttempts)[this.numOfLetters-1] as HTMLInputElement;
      if (nextInput && !this.endGame) {
        nextInput.disabled =false;
        nextInput.focus();
        this.numOfAttempts++;
      } else {
        this.onEndGame();
      }
      currentInput.disabled = true;
    } 

    numCorrect = 0;

  }

  onEndGame() {
    setTimeout(()=> {
      this.showToast();
    }, 500);
    this.endGame = true;
    let popup = this.popup.nativeElement;
    setTimeout(() => { 
      popup.style.visibility = 'visible';
    }, 3000);
  }

  onKeyPress(event: KeyboardEvent, letterNum: number) {
    // Backspace/Delete Key
    if (event.code == 'Backspace') {
      let attemptRow = document.getElementsByClassName('attempt-row-'+this.numOfAttempts);
      let prevElem;
      let currentElem = event.target as HTMLInputElement;
      if (letterNum >= this.numOfLetters-1 && currentElem.value != '') {
        prevElem = attemptRow[letterNum] as HTMLInputElement;
      } else {
        prevElem = attemptRow[letterNum-1] as HTMLInputElement;
        if (prevElem != undefined) {
          prevElem.value = '';
          prevElem.disabled = false;
          prevElem.focus();
          currentElem.disabled = true;
        }
      }
    }

    // Enter/Return Key
    if (event.code == 'Enter') {
      // Check to see if last letter is filled
      let input = document.getElementsByClassName('attempt-row-'+this.numOfAttempts)[this.numOfLetters-1] as HTMLInputElement;
      if (input.value) {
        this.onGuess();
      }
    }
  }

  showToast() {
    var elem = this.snackbar.nativeElement;

    if (elem) {
      if (this.numOfAttempts == 1) { this.toast = 'sheeshhh'} 
        else if (this.numOfAttempts == 2) { this.toast = 'nice work'}
        else if (this.numOfAttempts == 3) { this.toast = 'not bad'}
        else if (this.numOfAttempts == 4) { this.toast = 'not dumb'}
        else if (this.numOfAttempts == 5) { this.toast = 'oof'}
        else if (this.numOfAttempts == 6) { this.toast = 'awful'}
        else { this.toast = 'end game'}

      elem.className = "show";
      setTimeout(() => { elem!.className = elem!.className.replace("show", ""); }, 3000);
    } 
  }

  shareScore() {
    window.navigator['clipboard'].writeText(this.guessesStr);
    location.reload();
  }

  checkForDuplicates(inputs:any, word:string) {
    let wordArr = [...word];
    let temp = [...word];
    wordArr.forEach((letter:any, i: number) => {
      if (inputs[i].state == 'close') {
        let currentInd = 0;
        temp[i] = '';
        while (temp.includes(letter)) {
          currentInd = temp.indexOf(letter);
          if (inputs[currentInd].state == 'correct') {
            let wordleDuplicates = this.countDuplicates(inputs[i].value, wordArr);
            let guessDuplicates = this.countDuplicates(inputs[i].value, this.wordleArr);
            if (guessDuplicates < wordleDuplicates) {
              inputs[i].state = 'wrong';
            }
          }
          
          temp[currentInd] = '';
        }
      }
      temp = [...word]; 
    });
  }

  countDuplicates(char: any, wordArr:any) {
    let count = 0;
    wordArr.forEach(letter => {
      if (letter == char) count++;
    });
    return count; 
  }

}