import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronRight, RotateCcw, Info, Volume2, VolumeX, Menu, X } from 'lucide-react';
import { gsap } from 'gsap';
import { Helmet } from 'react-helmet-async';
import { 
  trackQuizStart, 
  trackQuizComplete, 
  trackQuestionAnswer, 
  trackQuestionSkip, 
  trackQuestionReveal, 
  trackSoundToggle, 
  trackQuizReset 
} from './utils/analytics';
import './App.css';


// Target number of correct answers to win - change this for debugging
const TARGET_CORRECT_ANSWERS = 10;

const RockbustersQuiz = () => {
  // Shuffle array function
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Load saved progress from localStorage
  const loadSavedData = () => {
    try {
      const saved = localStorage.getItem('rockbusters-progress');
      if (saved) {
        const data = JSON.parse(saved);
        return {
          currentQuestion: data.currentQuestion || 0,
          score: data.score || 0,
          answeredQuestions: new Set(data.answeredQuestions || []),
          skippedQuestions: new Set(data.skippedQuestions || []),
          questionOrder: data.questionOrder || null,
          totalAttempts: data.totalAttempts || 0
        };
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
    return {
      currentQuestion: 0,
      score: 0,
      answeredQuestions: new Set(),
      skippedQuestions: new Set(),
      questionOrder: null,
      totalAttempts: 0
    };
  };

  const questions = [
  {
    "question": "This young man prepared for his death.",
    "initials": "WY",
    "answer": "Will Young",
    "series": "xfm series 2",
    "rockbusters": "1",
    "date": "12 October 2002"
  },
  {
    "question": "Better than the average homeless person.",
    "initials": "S",
    "answer": "Supertramp",
    "series": "xfm series 2",
    "rockbusters": "1",
    "date": "12 October 2002"
  },
  {
    "question": "The little girl is hungry; what shall we do?",
    "initials": "F",
    "answer": "Feeder",
    "series": "xfm series 2",
    "rockbusters": "1",
    "date": "12 October 2002"
  },
  {
    "question": "Exploding pet.",
    "initials": "AK",
    "answer": "Atomic Kitten",
    "series": "xfm series 2",
    "rockbusters": "1",
    "date": "12 October 2002"
  },
  {
    "question": "I'll take that book to the toilet with me.",
    "initials": "LR",
    "answer": "Lou Reed",
    "series": "xfm series 2",
    "rockbusters": "2",
    "date": "19 October 2002"
  },
  {
    "question": "Blow the candles out before you eat the cake.",
    "initials": "FL",
    "answer": "Flaming Lips",
    "series": "xfm series 2",
    "rockbusters": "2",
    "date": "19 October 2002"
  },
  {
    "question": "How can I wash up in something shaped like that?",
    "initials": "NS",
    "answer": "NSync",
    "sound": "N sink",
    "series": "xfm series 2",
    "rockbusters": "2",
    "date": "19 October 2002"
  },
  {
    "question": "At the moment I'm in a river full of logs.",
    "initials": "JT",
    "answer": "Justin Timberlake",
    "series": "xfm series 2",
    "rockbusters": "3",
    "date": "26 October 2002"
  },
  {
    "question": "That lad's got bad asthma.",
    "initials": "W",
    "answer": "Weezer",
    "series": "xfm series 2",
    "rockbusters": "3",
    "date": "26 October 2002"
  },
  {
    "question": "I saw Mousetrap the other night, but the heating was knackered and it ruined the evening.",
    "initials": "C",
    "answer": "Coldplay",
    "series": "xfm series 2",
    "rockbusters": "3",
    "date": "26 October 2002"
  },
  {
    "question": "I don't like them birds; they shouldn't be allowed in this area.",
    "initials": "TB",
    "answer": "The Bangles",
    "sound": "ban gulls",
    "series": "xfm series 2",
    "rockbusters": "4",
    "date": "02 November 2002"
  },
  {
    "question": "He doesn't like women, yet he's got a couple of kids. That's a bit weird innit?",
    "initials": "PD",
    "answer": "Puff Daddy",
    "series": "xfm series 2",
    "rockbusters": "4",
    "date": "02 November 2002"
  },
  {
    "question": "That bloke who does sport on telly, he's got a little kid.",
    "initials": "DC",
    "answer": "Destiny's Child",
    "sound": "Des's tiny child (as in Des Lynam)",
    "series": "xfm series 2",
    "rockbusters": "4",
    "date": "02 November 2002"
  },
  {
    "question": "That army has got some well nice trenches.",
    "initials": "DW",
    "answer": "Dandy Warhols",
    "sound": "dandy war holes",
    "series": "xfm series 2",
    "rockbusters": "5",
    "date": "09 November 2002"
  },
  {
    "question": "The top of them curtains are wrecked; all the material's worn.",
    "initials": "HV",
    "answer": "Holly Valance",
    "sound": "Hole-y Valance",
    "series": "xfm series 2",
    "rockbusters": "5",
    "date": "09 November 2002"
  },
  {
    "question": "I was in Texas the other week, I fell over and landed on my knees in a puddle.",
    "initials": "WH",
    "answer": "Whitney Houston",
    "sound": "wet knee Houston",
    "series": "xfm series 2",
    "rockbusters": "5",
    "date": "09 November 2002"
  },
  {
    "question": "The fella has only got one badge left.",
    "initials": "E",
    "answer": "Elastica",
    "sound": "his last sticker",
    "series": "xfm series 2",
    "rockbusters": "6",
    "date": "16 November 2002"
  },
  {
    "question": "The unmarried lady is a friend I eat out with.",
    "initials": "MD",
    "answer": "Ms Dynamite",
    "sound": "miss dinner mate",
    "series": "xfm series 2",
    "rockbusters": "6",
    "date": "16 November 2002"
  },
  {
    "question": "I really really love that woman. I love everything she does.",
    "initials": "M",
    "answer": "Madonna",
    "sound": "mad on her",
    "series": "xfm series 2",
    "rockbusters": "6",
    "date": "16 November 2002"
  },
  {
    "question": "Stop throwing that fruit about.",
    "initials": "CB",
    "answer": "Chuck Berry",
    "series": "xfm series 2",
    "rockbusters": "7",
    "date": "23 November 2002"
  },
  {
    "question": "That Scottish fella has made an error.",
    "initials": "M",
    "answer": "MisTeeq",
    "sound": "mistake",
    "series": "xfm series 2",
    "rockbusters": "7",
    "date": "23 November 2002"
  },
  {
    "question": "God, you can make a right load of toast with them.",
    "initials": "G",
    "answer": "Gorillaz",
    "sound": "Grillers",
    "series": "xfm series 2",
    "rockbusters": "7",
    "date": "23 November 2002"
  },
  {
    "question": "You've been dunking that for too long.",
    "initials": "LB",
    "answer": "Limp Bizkit",
    "series": "xfm series 2",
    "rockbusters": "8",
    "date": "30 November 2002"
  },
  {
    "question": "You won't be able to play that game in this pub. The table ain't big enough",
    "initials": "FD",
    "answer": "Fats Domino",
    "series": "xfm series 2",
    "rockbusters": "8",
    "date": "30 November 2002"
  },
  {
    "question": "Well, I've had a rubbish day so I'm happy it's over.",
    "initials": "GK",
    "answer": "Gladys Knight",
    "sound": "glad it's night",
    "series": "xfm series 2",
    "rockbusters": "8",
    "date": "30 November 2002"
  },
  {
    "question": "That'll never get off the ground.",
    "initials": "LZ",
    "answer": "Led Zeppelin",
    "series": "xfm series 2",
    "rockbusters": "9",
    "date": "07 December 2002"
  },
  {
    "question": "That woman's got her husbands gloves and a pair of her own.",
    "initials": "HH",
    "answer": "Hermans Hermits",
    "sound": "her man's, her mitts",
    "series": "xfm series 2",
    "rockbusters": "9",
    "date": "07 December 2002"
  },
  {
    "question": "You'll get a load of bacon off them.",
    "initials": "L",
    "answer": "Longpigs",
    "series": "xfm series 2",
    "rockbusters": "9",
    "date": "07 December 2002"
  },
  {
    "question": "There's a load of letters there asking for advice. Put them on Claire's desk. Oh and, er, have a good Christmas.",
    "initials": "F",
    "answer": "Foreigner",
    "sound": "for Rayner (as in Claire Rayner))",
    "series": "xfm series 2",
    "rockbusters": "10",
    "date": "21 December 2002"
  },
  {
    "question": "Ask your mum if you should, after you've wrapped the presents.",
    "initials": "S",
    "answer": "Shalamar",
    "sound": "shall I, ma?",
    "series": "xfm series 2",
    "rockbusters": "10",
    "date": "21 December 2002"
  },
  {
    "question": "A couple of people were arguing in the supermarket at the fruit and veg counter, but it's busy in there 'cause it's Christmas so that's probably what brought it on.",
    "initials": "B",
    "answer": "Bananarama",
    "sound": "banana drama",
    "series": "xfm series 2",
    "rockbusters": "10",
    "date": "21 December 2002"
  },
  {
    "question": "42 pounds for a torch? That's a bit pricey innit?",
    "initials": "D",
    "answer": "DeeeLite",
    "sound": "dear light",
    "series": "xfm series 2",
    "rockbusters": "11",
    "date": "04 January 2003"
  },
  {
    "question": "He'll fit some chocolate to your feet.",
    "initials": "A",
    "answer": "Aerosmith",
    "series": "xfm series 2",
    "rockbusters": "11",
    "date": "04 January 2003"
  },
  {
    "question": "Do you think your kid will get that strawberry for me?",
    "initials": "WP",
    "answer": "Wilson Picket",
    "sound": "will son pick it?",
    "series": "xfm series 2",
    "rockbusters": "11",
    "date": "04 January 2003"
  },
  {
    "question": "Don't argue with him. He ain't gonna change his mind.",
    "initials": "AA",
    "answer": "Adam Ant",
    "series": "xfm series 2",
    "rockbusters": "12",
    "date": "11 January 2003"
  },
  {
    "question": "He always gets what he wants and doesn't worry about anyone else.",
    "initials": "P",
    "answer": "Pixies",
    "sound": "picks his",
    "series": "xfm series 2",
    "rockbusters": "12",
    "date": "11 January 2003"
  },
  {
    "question": "I'll have to put that woman in the oven.",
    "initials": "AB",
    "answer": "Anita Baker",
    "sound": "I need to bake her",
    "series": "xfm series 2",
    "rockbusters": "12",
    "date": "11 January 2003"
  },
  {
    "question": "I've got three other jumpers like this one.",
    "initials": "FT",
    "answer": "Four Tops",
    "series": "xfm series 2",
    "rockbusters": "13",
    "date": "18 January 2003"
  },
  {
    "question": "Those people can't make up their minds whether to sit in the sun or not.",
    "initials": "C",
    "answer": "Charlatans",
    "sound": "shall-I-tans?",
    "series": "xfm series 2",
    "rockbusters": "13",
    "date": "18 January 2003"
  },
  {
    "question": "That Jamaican fella needs an aspirin. Why is that?",
    "initials": "FP",
    "answer": "Freda Payne",
    "sound": "free da pain",
    "series": "xfm series 2",
    "rockbusters": "13",
    "date": "18 January 2003"
  },
  {
    "question": "The weather stinks, dunnit?",
    "initials": "R",
    "answer": "Rainbow",
    "sound": "rain b.o.",
    "series": "xfm series 2",
    "rockbusters": "14",
    "date": "25 January 2003"
  },
  {
    "question": "Look, gran, just get on the boat and help us out will you.",
    "initials": "R",
    "answer": "Ronan",
    "sound": "row, nan",
    "series": "xfm series 2",
    "rockbusters": "14",
    "date": "25 January 2003"
  },
  {
    "question": "If you're going to do that with your drink, I'd wait for it to settle a bit.",
    "initials": "CK",
    "answer": "Chaka Khan",
    "sound": "shake a can",
    "series": "xfm series 2",
    "rockbusters": "14",
    "date": "25 January 2003"
  },
  {
    "question": "The Australian picks two blokes.",
    "initials": "E",
    "answer": "Eminem",
    "sound": "'im and 'im",
    "series": "xfm series 2",
    "rockbusters": "15",
    "date": "01 February 2003"
  },
  {
    "question": "That builder is a bit cute.",
    "initials": "BT",
    "answer": "Bonnie Tyler",
    "series": "xfm series 2",
    "rockbusters": "15",
    "date": "01 February 2003"
  },
  {
    "question": "Well, if he would've been wearing a helmet he'd have been alright.",
    "initials": "B",
    "answer": "Busted",
    "sound": "Bust head",
    "series": "xfm series 2",
    "rockbusters": "16",
    "date": "08 February 2003"
  },
  {
    "question": "Why are them Jamaican men swinging fish around their head?",
    "initials": "DS",
    "answer": "Detroit Spinners",
    "sound": "de trout spinners",
    "series": "xfm series 2",
    "rockbusters": "16",
    "date": "08 February 2003"
  },
  {
    "question": "The northern lad remembers he has to tell his mom's daughter something.",
    "initials": "O",
    "answer": "Oasis",
    "sound": "oh, hey sis",
    "series": "xfm series 2",
    "rockbusters": "17",
    "date": "15 February 2003"
  },
  {
    "question": "The person from Birmingham got a C in their degree.",
    "initials": "T",
    "answer": "Toto",
    "sound": "2.2",
    "series": "xfm series 2",
    "rockbusters": "17",
    "date": "15 February 2003"
  },
  {
    "question": "The cockney fella isn't happy. Everything's going wrong.",
    "initials": "DH",
    "answer": "Dan Hill",
    "sound": "Down hill",
    "series": "xfm series 2",
    "rockbusters": "17",
    "date": "15 February 2003"
  },
  {
    "question": "The gingerbread man has only got one leg.",
    "initials": "LB",
    "answer": "Limp Bizkit",
    "sound": "Limp biscuit",
    "series": "xfm series 2",
    "rockbusters": "18",
    "date": "26 April 2003"
  },
  {
    "question": "These people from the East Midlands swear a lot.",
    "initials": "TTD",
    "answer": "Terence Trent Darby",
    "sound": "Tourette's Trent Derby",
    "series": "xfm series 2",
    "rockbusters": "18",
    "date": "26 April 2003"
  },
  {
    "question": "Have a holiday in Italy.",
    "initials": "TB",
    "answer": "Turin Brakes",
    "sound": "Turin breaks",
    "series": "xfm series 2",
    "rockbusters": "18",
    "date": "26 April 2003"
  },
  {
    "question": "The hitchhiker needs a lift but in something bigger than a car.",
    "initials": "VH",
    "answer": "Van Halen",
    "sound": "Van hailing",
    "series": "xfm series 2",
    "rockbusters": "19",
    "date": "03 May 2003"
  },
  {
    "question": "Don't be selfish, hand some of it out to your mates.",
    "initials": "C",
    "answer": "Cher",
    "sound": "Share",
    "series": "xfm series 2",
    "rockbusters": "19",
    "date": "03 May 2003"
  },
  {
    "question": "The Scottish fellas can't get into their emails.",
    "initials": "KL",
    "answer": "Kenny Loggins",
    "sound": "cannae login",
    "series": "xfm series 2",
    "rockbusters": "19",
    "date": "03 May 2003"
  },
  {
    "question": "Me younger brother spotted you the other day.",
    "initials": "JS",
    "answer": "Junior Senior",
    "sound": "junior seen yer",
    "series": "xfm series 2",
    "rockbusters": "20",
    "date": "10 May 2003"
  },
  {
    "question": "That champagne belongs to the boxer's kid.",
    "initials": "AM",
    "answer": "Alison Moyet",
    "sound": "Ali's son's Moët",
    "series": "xfm series 2",
    "rockbusters": "20",
    "date": "10 May 2003"
  },
  {
    "question": "The vibrators.",
    "initials": "B",
    "answer": "Buzzcocks",
    "series": "xfm series 2",
    "rockbusters": "20",
    "date": "10 May 2003"
  },
  {
    "question": "Oh, they're havin' a few problems and that. They haven't got any rice left.",
    "initials": "CC",
    "answer": "China Crisis",
    "series": "xfm series 2",
    "rockbusters": "21",
    "date": "17 May 2003"
  },
  {
    "question": "The Geordie fella doesn't know what he's being charged for.",
    "initials": "BW",
    "answer": "Bill Wyman",
    "sound": "bill? why, man?",
    "series": "xfm series 2",
    "rockbusters": "21",
    "date": "17 May 2003"
  },
  {
    "question": "I had two bricks and I had to throw 'em at two women, right, and I didn't hit either of 'em.",
    "initials": "MM",
    "answer": "Mister Mister",
    "sound": "Missed her, missed her",
    "series": "xfm series 2",
    "rockbusters": "21",
    "date": "17 May 2003"
  },
  {
    "question": "The customer wanted some paint to darken up her room. The shop assistant knew what to do.",
    "initials": "CB",
    "answer": "Cilla Black",
    "sound": "sell her black",
    "series": "xfm series 2",
    "rockbusters": "22",
    "date": "31 May 2003"
  },
  {
    "question": "It'd be all right if their heads weren't so big.",
    "initials": "SF",
    "answer": "Small Faces",
    "series": "xfm series 2",
    "rockbusters": "22",
    "date": "31 May 2003"
  },
  {
    "question": "Chanel have got another perfume out.",
    "initials": "NO",
    "answer": "New Order",
    "sound": "new odor",
    "series": "xfm series 2",
    "rockbusters": "22",
    "date": "31 May 2003"
  },
  {
    "question": "That fella likes sucking on iron.",
    "initials": "M",
    "answer": "Metallica",
    "sound": "metal licker",
    "series": "xfm series 2",
    "rockbusters": "23",
    "date": "07 June 2003"
  },
  {
    "question": "The Jamaican fella spots a boat.",
    "initials": "D",
    "answer": "DeBarge",
    "sound": "The barge",
    "series": "xfm series 2",
    "rockbusters": "23",
    "date": "07 June 2003"
  },
  {
    "question": "Do you want a game of tug of war? Well, it's up to you, you own it.",
    "initials": "E",
    "answer": "Europe",
    "sound": "your rope",
    "series": "xfm series 2",
    "rockbusters": "23",
    "date": "07 June 2003"
  },
  {
    "question": "He's got American coins all down his spine.",
    "initials": "N",
    "answer": "Nickelback",
    "series": "xfm series 2",
    "rockbusters": "24",
    "date": "14 June 2003"
  },
  {
    "question": "Jeremy Beadle has got a little bit of arthritis. What's going on there?",
    "initials": "SLF",
    "answer": "Stiff Little Fingers",
    "series": "xfm series 2",
    "rockbusters": "24",
    "date": "14 June 2003"
  },
  {
    "question": "Foxy, Shipman and some country and western singer on a merry go round.",
    "initials": "SD",
    "answer": "Spin Doctors",
    "sound": "the country and western singer was Dr Hook.",
    "series": "xfm series 2",
    "rockbusters": "24",
    "date": "14 June 2003"
  },
  {
    "question": "If you're going to France by boat, you might as well buy your fags there because you'll get 'em a lot cheaper.",
    "initials": "BF",
    "answer": "Bryan Ferry",
    "sound": "buy on ferry",
    "series": "xfm series 2",
    "rockbusters": "25",
    "date": "21 June 2003"
  },
  {
    "question": "This little foreign cafe's growing its own steak.",
    "initials": "DA",
    "answer": "Del Amitri",
    "sound": "deli meat tree",
    "series": "xfm series 2",
    "rockbusters": "25",
    "date": "21 June 2003"
  },
  {
    "question": "The Jamaican fella might have screamed this on the Titanic.",
    "initials": "CD",
    "answer": "Chris DeBurgh",
    "sound": "Christ, de berg!",
    "series": "xfm series 2",
    "rockbusters": "25",
    "date": "21 June 2003"
  },
  {
    "question": "The doctor said part of the foot and the leg was no good, so he took 'em off and threw 'em away.",
    "initials": "TB",
    "answer": "Tony Bennett",
    "sound": "toe, knee, bin it!",
    "series": "xfm series 2",
    "rockbusters": "26",
    "date": "28 June 2003"
  },
  {
    "question": "The Scottish monster has got a bit of a tan.",
    "initials": "TD",
    "answer": "The Darkness",
    "sound": "The dark ness",
    "series": "xfm series 2",
    "rockbusters": "26",
    "date": "28 June 2003"
  },
  {
    "question": "Well, the 60's singer had a heart attack whilst he was 'avin it away. We won't be seeing him again.",
    "initials": "FNM",
    "answer": "Faith No More",
    "sound": "Adam Faith no more",
    "series": "xfm series 2",
    "rockbusters": "26",
    "date": "28 June 2003"
  },
  {
    "question": "All the police cars are on fire.",
    "initials": "BS",
    "answer": "Blazin Squad",
    "series": "xfm series 2",
    "rockbusters": "27",
    "date": "05 July 2003"
  },
  {
    "question": "The director of '28 Days Later' is shouting about sleeping outside.",
    "initials": "DB",
    "answer": "Daniel Bedingfield",
    "sound": "Dan yell, \"Bed in field!\" (as in Danny Boyle))",
    "series": "xfm series 2",
    "rockbusters": "27",
    "date": "05 July 2003"
  },
  {
    "question": "He wants to be a sailor. Why's that?",
    "initials": "B",
    "answer": "Beyoncé",
    "sound": "be on sea",
    "series": "xfm series 2",
    "rockbusters": "27",
    "date": "05 July 2003"
  },
  {
    "question": "This vegetable started life down under.",
    "initials": "KO",
    "answer": "Kelly Osbourne",
    "sound": "cauli Oz born",
    "series": "xfm series 2",
    "rockbusters": "28",
    "date": "16 August 2003"
  },
  {
    "question": "The things that you normally find on the beach have been found floating round the moon.",
    "initials": "TS",
    "answer": "The Specials",
    "sound": "the space shells",
    "series": "xfm series 2",
    "rockbusters": "28",
    "date": "16 August 2003"
  },
  {
    "question": "If you put that many in the post I'm surprised I didn't receive one.",
    "initials": "FC",
    "answer": "50 Cent",
    "sound": "fifty sent",
    "series": "xfm series 2",
    "rockbusters": "28",
    "date": "16 August 2003"
  },
  {
    "question": "That Teletubby has got lice.",
    "initials": "TP",
    "answer": "The Police",
    "series": "xfm series 3",
    "rockbusters": "29",
    "date": "08 November 2003"
  },
  {
    "question": "I'm saving that money to buy condoms.",
    "initials": "JC",
    "answer": "Johnny Cash",
    "series": "xfm series 3",
    "rockbusters": "29",
    "date": "08 November 2003"
  },
  {
    "question": "When you're making bread, add a bit of color for a change.",
    "initials": "D",
    "answer": "Dido",
    "sound": "dye dough",
    "series": "xfm series 3",
    "rockbusters": "29",
    "date": "08 November 2003"
  },
  {
    "question": "If you go to Chepstow you will.",
    "initials": "S",
    "answer": "Seahorses",
    "sound": "see horses",
    "series": "xfm series 3",
    "rockbusters": "30",
    "date": "15 November 2003"
  },
  {
    "question": "ET's upset. What's he upset for, what's wrong with him?",
    "initials": "ME",
    "answer": "Missy Elliot",
    "sound": "missing Elliot",
    "series": "xfm series 3",
    "rockbusters": "30",
    "date": "15 November 2003"
  },
  {
    "question": "I had a tape with Humpty Dumpty and Hickory Dickory Dock on it, but I broke it.",
    "initials": "BR",
    "answer": "Busta Rhymes",
    "sound": "busted rhymes",
    "series": "xfm series 3",
    "rockbusters": "30",
    "date": "15 November 2003"
  },
  {
    "question": "I'm going to the north east. What are you going there for?",
    "initials": "S",
    "answer": "Seal",
    "sound": "see Hull",
    "series": "xfm series 3",
    "rockbusters": "31",
    "date": "22 November 2003"
  },
  {
    "question": "Ah yeah, she's related to the man in the lamp, you know.",
    "initials": "G",
    "answer": "Genesis",
    "sound": "genie sis",
    "series": "xfm series 3",
    "rockbusters": "31",
    "date": "22 November 2003"
  },
  {
    "question": "The Jamaican fella would love to live there, but it's a little bit pricey.",
    "initials": "DS",
    "answer": "Dire Straits",
    "sound": "dear streets",
    "series": "xfm series 3",
    "rockbusters": "31",
    "date": "22 November 2003"
  },
  {
    "question": "I can't do any photos cos it's been nicked by a German.",
    "initials": "AC",
    "answer": "Aztec Camera",
    "sound": "has took/take camera",
    "series": "xfm series 3",
    "rockbusters": "32",
    "date": "13 December 2003"
  },
  {
    "question": "If you keep eating, this part of your body will get bigger.",
    "initials": "PC",
    "answer": "Phil Collins",
    "sound": "fill colons",
    "series": "xfm series 3",
    "rockbusters": "32",
    "date": "13 December 2003"
  },
  {
    "question": "The place where you go to take your dog a walk and that, or you might go there on a Sunday. People, sort of, might taste that area.",
    "initials": "AP",
    "answer": "Alex Parks",
    "sound": "A licks parks",
    "series": "xfm series 3",
    "rockbusters": "32",
    "date": "13 December 2003"
  },
  {
    "question": "Will you leave the entrance to me garden alone?",
    "initials": "GG",
    "answer": "Gareth Gates",
    "sound": "ger'off gates",
    "series": "xfm series 3",
    "rockbusters": "33",
    "date": "03 January 2004"
  },
  {
    "question": "Don't phone but you can send a message on me mobile.",
    "initials": "T",
    "answer": "Texas",
    "sound": "text us",
    "series": "xfm series 3",
    "rockbusters": "33",
    "date": "03 January 2004"
  },
  {
    "question": "We were sharing out the male sheep and that, and I think I got the best one.",
    "initials": "DG",
    "answer": "Delta Goodrem",
    "sound": "dealt a good ram",
    "series": "xfm series 3",
    "rockbusters": "33",
    "date": "03 January 2004"
  },
  {
    "question": "Don't be stealing my tools. Take your sister's.",
    "initials": "NK",
    "answer": "Nik Kershaw",
    "sound": "nick her saw",
    "series": "xfm series 3",
    "rockbusters": "34",
    "date": "10 January 2004"
  },
  {
    "question": "Buy it if you want, I'm not that bothered. Think about it. Come back, right, come back if you want. Check some other places out first before you, you know. I'm not fussed. Shop around, come back. It's up to you. I'm not pushing you into anything.",
    "initials": "SC",
    "answer": "Soft Cell",
    "series": "xfm series 3",
    "rockbusters": "34",
    "date": "10 January 2004"
  },
  {
    "question": "That's good, I can play ten pin bowling again.",
    "initials": "O",
    "answer": "Outkast",
    "sound": "as in I had a broken arm but now I'm out of my cast",
    "series": "xfm series 3",
    "rockbusters": "34",
    "date": "10 January 2004"
  },
  {
    "question": "The Jamaican fella wrote a review for 'Phoenix Nights.'",
    "initials": "DC",
    "answer": "Divine Comedy",
    "sound": "da fine comedy",
    "series": "xfm series 3",
    "rockbusters": "35",
    "date": "17 January 2004"
  },
  {
    "question": "We should all vote for Paul Daniels, David Blaine, Copperfield, The Great Soprendo, Tommy Cooper and Derren Brown. Why's that? What's going on there?",
    "initials": "ES",
    "answer": "Electric Six",
    "sound": "elect trick six",
    "series": "xfm series 3",
    "rockbusters": "35",
    "date": "17 January 2004"
  },
  {
    "question": "Steve, what did your dad do? Ricky, what did your dad do? Can work on anyone.",
    "initials": "E",
    "answer": "Erasure",
    "sound": "he raised yer",
    "series": "xfm series 3",
    "rockbusters": "35",
    "date": "17 January 2004"
  },
  {
    "question": "So if you got, like, a bulb and you look after it, and you teach it stuff and all that. What are you doing there? Do you know what I mean?",
    "initials": "R",
    "answer": "Razorlight",
    "sound": "raise a light",
    "series": "xfm series 4",
    "rockbusters": "36",
    "date": "28 May 2005"
  },
  {
    "question": "People have a problem doing this when they get home from a night out drinking. What's the problem they've got?",
    "initials": "K",
    "answer": "Keane",
    "sound": "key in",
    "series": "xfm series 4",
    "rockbusters": "36",
    "date": "28 May 2005"
  },
  {
    "question": "I had a vision of that Chinese flu.",
    "initials": "C",
    "answer": "Caesars",
    "sound": "see SARS",
    "series": "xfm series 4",
    "rockbusters": "36",
    "date": "28 May 2005"
  },
  {
    "question": "The fella let his wife know how he got the bruise on his leg.",
    "initials": "CL",
    "answer": "Courtney Love",
    "sound": "caught knee, love",
    "series": "xfm series 4",
    "rockbusters": "37",
    "date": "04 June 2005"
  },
  {
    "question": "That Potter lad has a lot of bottle messin' about with the wizards.",
    "initials": "TB",
    "answer": "The Bravery",
    "sound": "brave Harry",
    "series": "xfm series 4",
    "rockbusters": "37",
    "date": "04 June 2005"
  },
  {
    "question": "The Buddhists won't be able to get into their temple without these.",
    "initials": "TM",
    "answer": "The Monkees",
    "sound": "monk keys",
    "series": "xfm series 4",
    "rockbusters": "37",
    "date": "04 June 2005"
  },
  {
    "question": "There's a vehicle that sells kebabs.",
    "initials": "D",
    "answer": "Donovan",
    "sound": "donner van",
    "series": "xfm series 4",
    "rockbusters": "38",
    "date": "11 June 2005"
  },
  {
    "question": "You're asked if you want that bit of the egg. You think about it, then you sort of decide against it.",
    "initials": "YO",
    "answer": "Yoko Ono",
    "sound": "yolk? oh... oh no",
    "series": "xfm series 4",
    "rockbusters": "38",
    "date": "11 June 2005"
  },
  {
    "question": "I don't think this burger will catch on.",
    "initials": "M",
    "answer": "McFly",
    "sound": "as in a McDonalds burger made of flies",
    "series": "xfm series 4",
    "rockbusters": "38",
    "date": "11 June 2005"
  },
  {
    "question": "Why don't you borrow some land off Mr. Boardman, Mr. Laurel or Mr. Fletcher?",
    "initials": "LS",
    "answer": "Lisa Stansfield",
    "sound": "lease a Stan's field",
    "series": "xfm series 4",
    "rockbusters": "39",
    "date": "18 June 2005"
  },
  {
    "question": "I'm going to annoy those sea birds over there.",
    "initials": "B",
    "answer": "Buggles",
    "sound": "bug gulls",
    "series": "xfm series 4",
    "rockbusters": "39",
    "date": "18 June 2005"
  },
  {
    "question": "What the Scouse fella said to the robber he found in his vineyard.",
    "initials": "AW",
    "answer": "Amy Winehouse",
    "sound": "ay, me wine house!",
    "series": "xfm series 4",
    "rockbusters": "39",
    "date": "18 June 2005"
  },
  {
    "question": "When I'm ill I throw up horse food. What's going on there?",
    "initials": "IH",
    "answer": "Isaac Hayes",
    "sound": "I sick hays",
    "series": "xfm series 4",
    "rockbusters": "40",
    "date": "25 June 2005"
  },
  {
    "question": "That garden tool isn't yours. Give it back.",
    "initials": "ND",
    "answer": "Nick Drake",
    "sound": "nicked rake",
    "series": "xfm series 4",
    "rockbusters": "40",
    "date": "25 June 2005"
  },
  {
    "question": "That male sheep sounds fed up. Why's he fed up?",
    "initials": "TR",
    "answer": "The Ramones",
    "sound": "the ram moans",
    "series": "xfm series 4",
    "rockbusters": "40",
    "date": "25 June 2005"
  },
  {
    "question": "Richard's kid cuts hair for a living.",
    "initials": "BD",
    "answer": "Barbara Dickson",
    "sound": "barber Dick's son",
    "series": "xfm series 4",
    "rockbusters": "41",
    "date": "02 July 2005"
  },
  {
    "question": "I have a problem saying the French word for 'well.'",
    "initials": "K",
    "answer": "Kasabian",
    "sound": "can't say bien",
    "series": "xfm series 4",
    "rockbusters": "41",
    "date": "02 July 2005"
  },
  {
    "question": "Take 52 kebabs, times that by 27 kebabs. The fella is struggling to work it out.",
    "initials": "DS",
    "answer": "Donna Summer",
    "sound": "donner sum, er?",
    "series": "xfm series 4",
    "rockbusters": "41",
    "date": "02 July 2005"
  },
  {
    "question": "Put the, er...right, d'ya know them little information cards you get in a mobile phone? What's that called? But, put that on a spider's house.",
    "initials": "SW",
    "answer": "Simon Webbe",
    "sound": "SIM on web",
    "series": "Radio 2 Shows",
    "rockbusters": "42",
    "date": "24 December 2005"
  },
  {
    "question": "Diana Ross isn't, you know, sort of feeling that good at the moment. What's up with 'er?",
    "initials": "ID",
    "answer": "Il Divo",
    "sound": "ill diva",
    "series": "Radio 2 Shows",
    "rockbusters": "42",
    "date": "24 December 2005"
  },
  {
    "question": "That stuff that I put on my toast, *lick lick* it doesn't taste sharp enough. *lick lick* What's going on there?",
    "initials": "JB",
    "answer": "James Blunt",
    "sound": "jam's blunt",
    "series": "Radio 2 Shows",
    "rockbusters": "42",
    "date": "24 December 2005"
  },
  {
    "question": "I've got snails, croissants and baguettes in me palm. What's going on there?",
    "initials": "FF",
    "answer": "Franz Ferdinand",
    "sound": "French food in hand",
    "series": "Radio 2 Shows",
    "rockbusters": "43",
    "date": "31 December 2005"
  },
  {
    "question": "Me granny's taking a penalty. She better get the ball in the back of the net.",
    "initials": "NM",
    "answer": "Nana Mouskouri",
    "sound": "nanna must score 'ere",
    "series": "Radio 2 Shows",
    "rockbusters": "43",
    "date": "31 December 2005"
  },
  {
    "question": "I'm where people go to relieve themselves after looking at elephants and that. What am I?",
    "initials": "A",
    "answer": "Amazulu",
    "sound": "I'm a zoo loo",
    "series": "Radio 2 Shows",
    "rockbusters": "43",
    "date": "31 December 2005"
  },
  {
    "question": "I don't want a house that far away from the water. I want to be right on top of it.",
    "initials": "B",
    "answer": "Beyonce",
    "sound": "be on sea",
    "series": "The Ricky Gervais Show",
    "rockbusters": "44",
    "date": "Series 2, Episode 1"
  },
  {
    "question": "That part of me leg is English.",
    "initials": "B",
    "answer": "Britney",
    "series": "The Ricky Gervais Show",
    "rockbusters": "44",
    "date": "Series 2, Episode 1"
  },
  {
    "question": "The fitness teacher has got a speech impediment.",
    "initials": "KW",
    "answer": "Kanye West",
    "sound": "can we rest?",
    "series": "The Ricky Gervais Show",
    "rockbusters": "44",
    "date": "Series 2, Episode 1"
  },
  {
    "question": "Steal that women's flower.",
    "initials": "RP",
    "answer": "Robert Plant",
    "sound": "rob her plant",
    "series": "The Ricky Gervais Show",
    "rockbusters": "45",
    "date": "Series 2, Episode 2"
  },
  {
    "question": "Keep whacking the cooker with a stick. (It doesn't have to be a stick.)",
    "initials": "B",
    "answer": "Beethoven",
    "sound": "beat oven",
    "series": "The Ricky Gervais Show",
    "rockbusters": "45",
    "date": "Series 2, Episode 2"
  },
  {
    "question": "Venice. It's all water, innit? How would you describe it?",
    "initials": "M",
    "answer": "Morrissey",
    "sound": "more is sea",
    "series": "The Ricky Gervais Show",
    "rockbusters": "45",
    "date": "Series 2, Episode 2"
  },
  {
    "question": "That Jamaican fella doesn't want anything.",
    "initials": "ND",
    "answer": "Neil Diamond",
    "sound": "nil demand",
    "series": "The Ricky Gervais Show",
    "rockbusters": "46",
    "date": "Series 2, Episode 3"
  },
  {
    "question": "I ask them to pass me the ball by using their head.",
    "initials": "E",
    "answer": "Editors",
    "sound": "head it [to] us",
    "series": "The Ricky Gervais Show",
    "rockbusters": "46",
    "date": "Series 2, Episode 3"
  },
  {
    "question": "He's got the woolly ones, but I've got the ones that run and charge at you.",
    "initials": "R",
    "answer": "The Ramones",
    "sound": "the ram ones",
    "series": "The Ricky Gervais Show",
    "rockbusters": "46",
    "date": "Series 2, Episode 3"
  },
  {
    "question": "I went to the restaurant on Monday, Tuesday, Wednesday, Thursday and Friday, Saturday and Sunday if you want, and the fella who makes the food was there each time.",
    "initials": "SC",
    "answer": "Sam Cooke",
    "sound": "same cook",
    "series": "The Ricky Gervais Show",
    "rockbusters": "47",
    "date": "Series 2, Episode 4"
  },
  {
    "question": "Go into that woman's store and rip her off.",
    "initials": "C",
    "answer": "Cornershop",
    "sound": "con her shop",
    "series": "The Ricky Gervais Show",
    "rockbusters": "47",
    "date": "Series 2, Episode 4"
  },
  {
    "question": "You've had a go at laying down a track, but it ain't perfect.",
    "initials": "E",
    "answer": "Eurythmics",
    "sound": "your rough mix",
    "series": "The Ricky Gervais Show",
    "rockbusters": "47",
    "date": "Series 2, Episode 4"
  },
  {
    "question": "Those songs you sing at Christmas, that bloke who sings 'em is brilliant at it.",
    "initials": "CK",
    "answer": "Carole King",
    "series": "The Ricky Gervais Show",
    "rockbusters": "48",
    "date": "Series 2, Episode 5"
  },
  {
    "question": "I told the homosexual man that the grape tree was mine.",
    "initials": "MG",
    "answer": "Marvin Gaye",
    "sound": "my vine, gay",
    "series": "The Ricky Gervais Show",
    "rockbusters": "48",
    "date": "Series 2, Episode 5"
  },
  {
    "question": "I ask you, Ricky, if you believe in Father Christmas. What do you say?",
    "initials": "S",
    "answer": "Santana",
    "sound": "Santa? nah",
    "series": "The Ricky Gervais Show",
    "rockbusters": "48",
    "date": "Series 2, Episode 5"
  },
  {
    "question": "That's a laptop...",
    "initials": "A",
    "answer": "Adele",
    "sound": "A dell",
    "series": "The T4 Appearance",
    "rockbusters": "49",
    "date": "April 2012"
  },
  {
    "question": "The Spanish people are celebrating about the present they got for Jesus.",
    "initials": "OM",
    "answer": "Olly Murs",
    "sound": "Ole! Myrrhs!",
    "series": "The T4 Appearance",
    "rockbusters": "49",
    "date": "April 2012"
  },
  {
    "question": "The Asian person's leg is a little bit angry.",
    "initials": "TT",
    "answer": "Tinie Tempah",
    "sound": "Thai knee temper",
    "series": "The T4 Appearance",
    "rockbusters": "49",
    "date": "April 2012"
  },
  {
    "question": "This group would be good at doing your hair.",
    "initials": "TP",
    "answer": "The Platters",
    "series": "Karl's Mam",
    "rockbusters": "7",
    "date": "23 November 2002"
  },
  {
    "question": "This group sound like dinosaurs.",
    "initials": "TR",
    "answer": "T Rex",
    "series": "Karl's Mam",
    "rockbusters": "7",
    "date": "23 November 2002"
  },
  {
    "question": "This group like to be by the sand and the sea.",
    "initials": "TBB",
    "answer": "The Beach Boys",
    "series": "Karl's Mam",
    "rockbusters": "7",
    "date": "23 November 2002"
  },
  {
    "question": "This guy sounds soup-perb.",
    "initials": "GC",
    "answer": "Glen Campbell",
    "series": "Karl's Mam",
    "rockbusters": "7",
    "date": "23 November 2002"
  },
  {
    "question": "This group are nice on toast.",
    "initials": "TJ",
    "answer": "The Jam",
    "series": "Karl's Mam",
    "rockbusters": "8",
    "date": "30 November 2002"
  },
  {
    "question": "This man liked his wine.",
    "initials": "DM",
    "answer": "Dean Martin",
    "series": "Karl's Mam",
    "rockbusters": "8",
    "date": "30 November 2002"
  },
  {
    "question": "Hope you're not speeding when you meet these.",
    "initials": "TP",
    "answer": "The Police",
    "series": "Karl's Mam",
    "rockbusters": "8",
    "date": "30 November 2002"
  },
  {
    "question": "Sounds like these lads work for the hospital.",
    "initials": "GP",
    "answer": "Gerry and the Pacemakers",
    "series": "Karl's Mam",
    "rockbusters": "8",
    "date": "30 November 2002"
  },
  {
    "question": "This group would go well with your Christmas dinner.",
    "initials": "TC",
    "answer": "The Cranberries",
    "series": "Karl's Mam",
    "rockbusters": "9",
    "date": "07 December 2002"
  },
  {
    "question": "They make a few good cupboards.",
    "initials": "TC",
    "answer": "The Carpenters",
    "series": "Karl's Mam",
    "rockbusters": "9",
    "date": "07 December 2002"
  },
  {
    "question": "This group thinks of lots of things.",
    "initials": "I",
    "answer": "Imagination",
    "series": "Karl's Mam",
    "rockbusters": "9",
    "date": "07 December 2002"
  },
  {
    "question": "She'd really like Blackpool.",
    "initials": "FA",
    "answer": "Fairground Attraction",
    "series": "Karl's Mam",
    "rockbusters": "9",
    "date": "07 December 2002"
  }
];

  const savedData = loadSavedData();
  
  // Initialize shuffled questions (randomize on each load)
  const [questionOrder] = useState(() => {
    return shuffleArray(Array.from({length: questions.length}, (_, i) => i));
  });
  
  const [currentQuestion, setCurrentQuestion] = useState(savedData.currentQuestion);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(savedData.score);
  const [answeredQuestions, setAnsweredQuestions] = useState(savedData.answeredQuestions);
  const [skippedQuestions, setSkippedQuestions] = useState(savedData.skippedQuestions);
  const [revealedQuestions, setRevealedQuestions] = useState(new Set());
  const [totalAttempts, setTotalAttempts] = useState(savedData.totalAttempts || 0);
  const [showResults, setShowResults] = useState(false);
  const [showCorrectModal, setShowCorrectModal] = useState(false);
  const [revealedAnswer, setRevealedAnswer] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizVisible, setQuizVisible] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const karlHeadRef = useRef(null);
  const inputRef = useRef(null);
  const correctModalButtonRef = useRef(null);

  // Lock body scroll when info modal is open
  useEffect(() => {
    if (showInfoModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showInfoModal]);

  // Save progress to localStorage
  const saveProgress = useCallback((questionIndex, newScore, answered, skipped, attempts) => {
    try {
      const progressData = {
        currentQuestion: questionIndex,
        score: newScore,
        answeredQuestions: Array.from(answered),
        skippedQuestions: Array.from(skipped),
        questionOrder: questionOrder,
        totalAttempts: attempts
      };
      localStorage.setItem('rockbusters-progress', JSON.stringify(progressData));
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }, [questionOrder]);

  // Sound functions
  const playIndividualCorrectSound = useCallback(() => {
    if (!isSoundEnabled) return;
    const audio = new Audio('/sounds/correct/correct.mp3');
    audio.play().catch(error => {
      console.log('Audio playback failed:', error);
    });
  }, [isSoundEnabled]);

  const playCorrectSound = useCallback(() => {
    if (!isSoundEnabled) return;
    const audio = new Audio('/sounds/correct/karl-hehey.mp3');
    audio.play().catch(error => {
      console.log('Audio playback failed:', error);
    });
  }, [isSoundEnabled]);

  const currentQ = questions[questionOrder[currentQuestion]];
  const correctAnswer = currentQ?.answer?.toLowerCase() || '';
  const userInput = userAnswer.toLowerCase();
  
  // Dynamic SEO content based on current state
  const getDynamicTitle = () => {
    if (showResults) {
      return `Quiz Complete! Score: ${score}/${TARGET_CORRECT_ANSWERS} - Rockbusters Quiz`;
    }
    if (currentQ) {
      return `Question ${currentQuestion + 1}: ${currentQ.initials} - Rockbusters Quiz`;
    }
    return 'Rockbusters Quiz - Test Your Knowledge with Karl Pilkington\'s Cryptic Clues';
  };

  const getDynamicDescription = () => {
    if (showResults) {
      return `Quiz completed with ${score} correct answers out of ${TARGET_CORRECT_ANSWERS} in ${totalAttempts} attempts. Challenge yourself with Karl Pilkington's cryptic music clues!`;
    }
    if (currentQ) {
      return `Current clue: "${currentQ.question}" (${currentQ.initials}). Can you guess this artist or band from Karl Pilkington's cryptic clue?`;
    }
    return 'Play the ultimate Rockbusters quiz featuring Karl Pilkington\'s infamous cryptic clues from The Ricky Gervais Show. Test your music knowledge with over 400 questions!';
  };
  
  // Get the full answer including prefilled initials
  const getCompleteAnswer = () => {
    if (!currentQ || !currentQ.initials) return '';
    const initials = currentQ.initials.toLowerCase();
    const words = correctAnswer.split(' ');
    let completeAnswer = '';
    let userIndex = 0;
    
    for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
      const word = words[wordIndex];
      
      if (wordIndex > 0) {
        completeAnswer += ' ';
      }
      
      for (let letterIndex = 0; letterIndex < word.length; letterIndex++) {
        if (letterIndex === 0 && wordIndex < initials.length) {
          // Use the prefilled initial
          completeAnswer += initials[wordIndex];
        } else {
          // Use the user's typed input
          completeAnswer += userInput[userIndex] || '';
          userIndex++;
        }
      }
    }
    
    return completeAnswer;
  };

  // Check if current answer is correct
  const isCurrentAnswerCorrect = getCompleteAnswer() === correctAnswer;

  // Update score when answer becomes correct
  useEffect(() => {
    if (isCurrentAnswerCorrect && !answeredQuestions.has(currentQuestion) && !revealedAnswer) {
      const newScore = score + 1;
      const newAnswered = new Set([...answeredQuestions, currentQuestion]);
      const newAttempts = totalAttempts + 1;
      
      setScore(newScore);
      setAnsweredQuestions(newAnswered);
      setTotalAttempts(newAttempts);
      
      // Play sound for individual correct answer
      playIndividualCorrectSound();
      
      // Check if we've reached target correct answers (win condition)
      if (newScore >= TARGET_CORRECT_ANSWERS) {
        // Play correct sound when quiz is completed
        playCorrectSound();
        // Track quiz completion
        trackQuizComplete(newScore, newAttempts);
        setShowResults(true);
        localStorage.removeItem('rockbusters-progress');
        return;
      }
      
      // Track correct answer
      trackQuestionAnswer(currentQuestion + 1, true, 1);
      
      // Add a slight delay before showing the modal for better UX
      setTimeout(() => {
        setShowCorrectModal(true);
      }, 500);
      
      saveProgress(currentQuestion, newScore, newAnswered, skippedQuestions, newAttempts);
    }
  }, [isCurrentAnswerCorrect, currentQuestion, answeredQuestions, score, skippedQuestions, revealedAnswer, totalAttempts, playCorrectSound, playIndividualCorrectSound, saveProgress]);

  // Animate Karl's head when welcome modal shows
  useEffect(() => {
    if (showWelcomeModal && karlHeadRef.current) {
      gsap.fromTo(karlHeadRef.current, 
        { scale: 0, rotation: 0 }, 
        { 
          scale: 1, 
          rotation: 360, 
          duration: 2, 
          ease: "elastic.out",
          delay: 0.3
        }
      );
    }
  }, [showWelcomeModal]);

  // Focus input when component loads or question changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputRef.current && !showWelcomeModal && !showCorrectModal && !showResults) {
        inputRef.current.focus();
        
        // On mobile, scroll the input into view after keyboard appears
        if (window.innerWidth <= 768) {
          // iOS typically needs more delay for keyboard animation
          const delay = /iPhone|iPad|iPod/i.test(navigator.userAgent) ? 300 : 150;
          
          setTimeout(() => {
            inputRef.current?.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
              inline: 'nearest'
            });
          }, delay);
        }
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [currentQuestion, showWelcomeModal, showCorrectModal, showResults]);

  // Handle space key press for correct answer modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (showCorrectModal && event.code === 'Space') {
        event.preventDefault();
        // Trigger the button click instead of calling nextQuestion directly
        if (correctModalButtonRef.current) {
          correctModalButtonRef.current.click();
        }
      }
    };

    if (showCorrectModal) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [showCorrectModal]);

  // Focus the correct modal button when modal opens
  useEffect(() => {
    if (showCorrectModal && correctModalButtonRef.current) {
      setTimeout(() => {
        correctModalButtonRef.current.focus();
      }, 100);
    }
  }, [showCorrectModal]);


  const renderMergedInput = () => {
    if (!currentQ) return [];
    const initials = currentQ.initials;
    const words = correctAnswer.split(' ');
    const result = [];
    let charIndex = 0;
    let userInputIndex = 0;

    for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
      const word = words[wordIndex];
      const wordChars = [];
      
      for (let letterIndex = 0; letterIndex < word.length; letterIndex++) {
        const correctChar = word[letterIndex];
        
        // Determine if this should be prefilled based on initials
        let shouldPrefill = false;
        let prefillChar = '';
        
        if (letterIndex === 0 && wordIndex < initials.length) {
          shouldPrefill = true;
          prefillChar = initials[wordIndex];
        }

        let displayChar;
        let className = 'char ';
        const isCursorHere = !shouldPrefill && userInputIndex === userInput.length;
        
        if (shouldPrefill) {
          displayChar = prefillChar;
          className += 'prefilled';
        } else {
          const userChar = userInput[userInputIndex] || '';
          const hasUserInput = userInputIndex < userInput.length;
          const isCorrect = userChar && userChar.toLowerCase() === correctChar.toLowerCase();
          
          if (hasUserInput) {
            displayChar = userChar;
            className += isCorrect ? 'correct' : 'incorrect';
          } else {
            displayChar = '_';
            className += 'empty';
            if (isCursorHere) {
              className += ' cursor-active';
            }
          }
          userInputIndex++;
        }

        wordChars.push(
          <span key={charIndex} className={className}>
            {displayChar}
            {isCursorHere && (
              <span className="blinking-cursor">|</span>
            )}
          </span>
        );
        charIndex++;
      }
      
      // Wrap each word in a word-group div
      result.push(
        <div key={`word-${wordIndex}`} className="word-group">
          {wordChars}
        </div>
      );
      
      // Add space after word (except last word)
      if (wordIndex < words.length - 1) {
        result.push(
          <span key={`space-${wordIndex}`} className="char space">
            &nbsp;
          </span>
        );
      }
    }

    return result;
  };

  const nextQuestion = () => {
    setShowCorrectModal(false);
    setRevealedAnswer(false);
    if (currentQuestion < questions.length - 1) {
      const newQuestionIndex = currentQuestion + 1;
      setCurrentQuestion(newQuestionIndex);
      setUserAnswer('');
      saveProgress(newQuestionIndex, score, answeredQuestions, skippedQuestions, totalAttempts);
      
      // Focus input after state updates
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          
          // On mobile, scroll into view after keyboard appears
          if (window.innerWidth <= 768) {
            setTimeout(() => {
              inputRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest'
              });
            }, 300);
          }
        }
      }, 100);
    } else {
      setShowResults(true);
      // Clear saved progress when quiz is complete
      localStorage.removeItem('rockbusters-progress');
    }
  };

  const skipQuestion = () => {
    // Play skip sound
    playSkipSound();
    
    // Track skip
    trackQuestionSkip(currentQuestion + 1);
    
    const newSkipped = new Set([...skippedQuestions, currentQuestion]);
    const newAttempts = totalAttempts + 1;
    
    setSkippedQuestions(newSkipped);
    setTotalAttempts(newAttempts);
    setRevealedAnswer(false);
    
    if (currentQuestion < questions.length - 1) {
      const newQuestionIndex = currentQuestion + 1;
      setCurrentQuestion(newQuestionIndex);
      setUserAnswer('');
      saveProgress(newQuestionIndex, score, answeredQuestions, newSkipped, newAttempts);
    } else {
      setShowResults(true);
      localStorage.removeItem('rockbusters-progress');
    }
  };

  const resetQuiz = () => {
    // Track quiz reset
    trackQuizReset();
    
    setCurrentQuestion(0);
    setUserAnswer('');
    setScore(0);
    setAnsweredQuestions(new Set());
    setSkippedQuestions(new Set());
    setRevealedQuestions(new Set());
    setTotalAttempts(0);
    setShowResults(false);
    setShowCorrectModal(false);
    setRevealedAnswer(false);
    setShowWelcomeModal(false);
    setShowQuiz(true);
    setQuizVisible(true);
    // Clear saved progress
    localStorage.removeItem('rockbusters-progress');
  };

  const closeWelcomeModal = () => {
    // Play welcome sound
    playWelcomeSound();
    
    // Track quiz start
    trackQuizStart();
    
    setShowWelcomeModal(false);
    
    // Show quiz container first, then fade it in
    setTimeout(() => {
      setShowQuiz(true);
      // Small delay to ensure DOM is ready, then fade in
      setTimeout(() => {
        setQuizVisible(true);
      }, 50);
    }, 100);
    
    // Focus input after welcome modal closes
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        
        // On mobile, scroll into view after keyboard appears
        if (window.innerWidth <= 768) {
          setTimeout(() => {
            inputRef.current?.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
              inline: 'nearest'
            });
          }, 300);
        }
      }
    }, 100);
  };

  const playRandomRevealSound = () => {
    if (!isSoundEnabled) return;
    const sounds = ['karl-whats-that.mp3', 'karl-err.mp3', 'karl-look-at-it.mp3', 'karl-its-awkward.mp3', 'karl-who-are-you.mp3'];
    const randomSound = sounds[Math.floor(Math.random() * sounds.length)];
    const audio = new Audio(`/sounds/reveal/${randomSound}`);
    audio.play().catch(error => {
      console.log('Audio playback failed:', error);
    });
  };


  const playSkipSound = () => {
    if (!isSoundEnabled) return;
    const sounds = ['karl-what.mp3', 'karl-lot-words.mp3', 'karl-dont-wanna-know.mp3', 'karl-ildas-dead.mp3'];
    const randomSound = sounds[Math.floor(Math.random() * sounds.length)];
    const audio = new Audio(`/sounds/skip/${randomSound}`);
    audio.play().catch(error => {
      console.log('Audio playback failed:', error);
    });
  };

  const playWelcomeSound = () => {
    if (!isSoundEnabled) return;
    const audio = new Audio('/sounds/welcome/karl-alright.mp3');
    audio.play().catch(error => {
      console.log('Audio playback failed:', error);
    });
  };

  const revealAnswer = () => {
    // Play random sound
    playRandomRevealSound();
    
    // Track reveal
    trackQuestionReveal(currentQuestion + 1);
    
    // Track this question as revealed
    const newRevealed = new Set([...revealedQuestions, currentQuestion]);
    setRevealedQuestions(newRevealed);
    
    // Set revealed flag first to prevent correct modal from showing
    setRevealedAnswer(true);
    setShowCorrectModal(false);
    
    // Increment attempts for reveal
    const newAttempts = totalAttempts + 1;
    setTotalAttempts(newAttempts);
    
    if (!currentQ || !currentQ.initials) return;
    
    // Calculate what the user should type (excluding prefilled initials and spaces)
    const initials = currentQ.initials.toLowerCase();
    const words = currentQ.answer.toLowerCase().split(' ');
    let userTypedPart = '';
    
    for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
      const word = words[wordIndex];
      
      // Don't add spaces to userTypedPart - they're handled separately in the display
      for (let letterIndex = 0; letterIndex < word.length; letterIndex++) {
        // Check if this is the first letter of a word and we have an initial for it
        const shouldPrefill = letterIndex === 0 && wordIndex < initials.length;
        
        if (!shouldPrefill) {
          userTypedPart += word[letterIndex];
        }
      }
    }
    
    setUserAnswer(userTypedPart);
  };

  if (showResults) {
    return (
      <div className="min-h-screen bg-head-pattern bg-repeat flex items-center justify-center p-4">
        <div className="bg-white border md:border-0 rounded-2xl shadow-lg p-8 max-w-2xl w-full text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Rockbusters Complete!</h1>
          <div className="text-6xl font-bold text-indigo-600 mb-6">{totalAttempts}</div>
          <div className="mb-8">
            <p className="text-xl mb-4">You got {TARGET_CORRECT_ANSWERS} correct answers in <strong>{totalAttempts}</strong> attempts!</p>
            <p>
              {totalAttempts <= 25
                ? "Outstanding! You're a true Rockbusters legend!" 
                : totalAttempts <= 35
                ? "Excellent work! Karl would be proud!"
                : totalAttempts <= 50
                ? "Good job! You know your music!"
                : "Not bad! The clues don't work, right?"}
            </p>
            <p className="text-gray-600 font-medium">
              Correct: {score} | Skipped/Revealed: {skippedQuestions.size + revealedQuestions.size}
            </p>
          </div>
          <button type="button" onClick={resetQuiz} className="bg-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-600 transition-colors flex items-center gap-3 mx-auto">
            <RotateCcw className="w-5 h-5" />
            Play Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{getDynamicTitle()}</title>
        <meta name="description" content={getDynamicDescription()} />
        <meta property="og:title" content={getDynamicTitle()} />
        <meta property="og:description" content={getDynamicDescription()} />
        <meta property="twitter:title" content={getDynamicTitle()} />
        <meta property="twitter:description" content={getDynamicDescription()} />
        {showResults && <meta name="robots" content="noindex" />}
      </Helmet>
      <div className="min-h-screen bg-head-pattern bg-repeat flex items-center justify-center md:p-4">
      {/* Welcome Modal */}
      {showWelcomeModal && (
        <div className="modal-overlay">
          <div className="modal-content welcome-modal">
            <picture>
              <source srcSet="/karl-head.webp" type="image/webp" />
              <img ref={karlHeadRef} src="/karl-head.png" alt="Karl Pilkington" className="w-20 md:w-32 mx-auto" />
            </picture>
            <h2 className="text-2xl md:text-4xl mt-0 md:mt-4">Welcome to Rockbusters!</h2>

            <div className="welcome-instructions">
              <p className="font-semibold text-gray-800 mb-2">How to play:</p>
              <p>• Read Karl's cryptic clue</p>
              <p>• Use the initials as a hint</p>
              <p>• Type your answer - first letters are prefilled</p>
              <p>• Click Skip if you're stuck, or Reveal to see the answer</p>
            </div>
            <button type="button" onClick={closeWelcomeModal} className="next-button py-2 bg-indigo-600 text-white rounded-lg transition-colors font-medium cursor-pointer hover:bg-indigo-700 px-10">
              Alright
            </button>
          </div>
        </div>
      )}

      {/* Correct Answer Modal */}
      {showCorrectModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="celebration">🎉</div>
            <h2 className='font-bold text-2xl mb-1'>Correct!</h2>
            <p className="answer-reveal">The answer was: <strong>{currentQ?.answer}</strong></p>
            {currentQ?.sound && (
              <p className="sound-reveal">Karls pronounciation: <em>{currentQ.sound}</em></p>
            )}
            <button 
              ref={correctModalButtonRef}
              type="button" 
              onClick={nextQuestion} 
              className="next-button py-2 bg-indigo-600 text-white rounded-lg transition-colors font-medium cursor-pointer hover:bg-indigo-700 w-full mt-4"
            >
              {currentQuestion === questions.length - 1 ? 'See Results' : 'Next Question'}
            </button>
          </div>
        </div>
      )}

      {/* Info Modal */}
      {showInfoModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="text-center mb-4">
              <Info className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-4">About Rockbusters</h2>
            </div>
            <div className="text-left space-y-4">
              <p className="text-gray-700 text-sm md:text-md">
                <strong>Rockbusters</strong> was a quiz segment from The Ricky Gervais Show on XFM radio, 
                hosted by Karl Pilkington from 2001-2005.
              </p>
              <p className="text-gray-700 text-sm md:text-md">
                Karl would give cryptic clues that were supposed to sound like band names or artists, 
                along with their initials. The clues were often confusing, barely made sense, or had 
                tenuous connections to the actual answers.
              </p>
              <p className="text-gray-700 text-sm md:text-md">
                <strong>How to play:</strong>
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4 text-sm md:text-md">
                <li>Read Karl's cryptic clue</li>
                <li>Use the initials as a hint</li>
                <li>Type your answer - first letters are prefilled</li>
                <li>Click Skip if you're stuck</li>
                <li>Click Reveal to see the answer</li>
              </ul>
              <a href="mailto:ricky.gervais@xfm.co.uk" className="text-blue-500 hover:underline mt-4 flex text-sm md:text-md">
                Submit your question and answers here
              </a>
              <p className="text-gray-700 text-sm md:text-md !mt-6">
                <strong>Support the developer:</strong>
              </p>
              <div className="flex justify-center mt-4">
                {/* Buy Me a Coffee Button */}
                <a
                  href="https://www.buymeacoffee.com/sjw87"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-3 rounded-lg shadow font-bold border border-gray-100 text-black hover:bg-gray-100 transition-colors"
                >
                  <span role="img" aria-label="coffee" className="mr-2">☕</span>
                  Buy me a coffee
                </a>
              </div>
            </div>
            <hr className="mb-0 mt-6 md:hidden" />
            <button 
              type="button"
              onClick={() => setShowInfoModal(false)} 
              className="w-full mt-6 py-3 bg-blue-600 text-white rounded-lg transition-colors font-medium cursor-pointer hover:bg-blue-700"
            >
              Alright, cheers
            </button>
          </div>
        </div>
      )}
      {/* Off-canvas Menu */}
      <>
        {/* Backdrop */}
        <div 
          className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ${showMenu ? 'bg-opacity-50' : 'bg-opacity-0 pointer-events-none'}`}
          onClick={() => setShowMenu(false)}
        ></div>
        
        {/* Menu Panel */}
        <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${showMenu ? 'translate-x-0' : 'translate-x-full'}`}>
          {/* Menu Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-800">Menu</h3>
            <button 
              type="button"
              onClick={() => setShowMenu(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          
          {/* Menu Items */}
          <div className="p-6 space-y-4">
            <button 
              type="button"
              onClick={() => {
                setShowInfoModal(true);
                setShowMenu(false);
              }}
              className="w-full text-left p-4 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3"
            >
              <Info className="w-5 h-5 text-blue-500" />
              <span className="text-gray-800 font-medium">Info</span>
            </button>
            
            <button 
              type="button"
              onClick={() => {
                const newSoundState = !isSoundEnabled;
                setIsSoundEnabled(newSoundState);
                trackSoundToggle(newSoundState);
              }}
              className="w-full text-left p-4 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3"
            >
              {isSoundEnabled ? (
                <>
                  <Volume2 className="w-5 h-5 text-green-500" />
                  <span className="text-gray-800 font-medium">Turn Sound Off</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-5 h-5 text-red-500" />
                  <span className="text-gray-800 font-medium">Turn Sound On</span>
                </>
              )}
            </button>
            
            <button 
              type="button"
              onClick={() => {
                resetQuiz();
                setShowMenu(false);
              }}
              className="w-full text-left p-4 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3"
            >
              <RotateCcw className="w-5 h-5 text-red-500" />
              <span className="text-gray-800 font-medium">Reset Game</span>
            </button>
          </div>
        </div>
      </>

      {showQuiz && (
        <div className={`bg-white md:rounded-2xl md:shadow-xl md:border md:border-[#f2f2f2] p-4 md:p-16 max-w-5xl w-full h-screen md:h-full transition-opacity duration-500 ${quizVisible ? 'opacity-100' : 'opacity-0'}`}>
        {/* Header */}
        <div className="text-center mb-2 md:mb-4">
          <div className="flex flex-row justify-between items-center mb-4 gap-y-4">
            <div className='flex flex-row items-center'>
              <picture>
                <source srcSet="/karl-head.webp" type="image/webp" />
                <img src="/karl-head.png" alt="Karl Pilkington" className="w-16 h-16 rounded-full object-cover ml-0 mr-2 md:mx-2 shadow-md" />
              </picture>
              <div className='flex flex-col items-start'>
                <h1 className="text-2xl md:text-5xl font-bold text-gray-800 flex items-center">
                  Rockbusters
                </h1>
                <span className='text-[11px] md:text-xs opacity-60'>AKA And the clues dont work</span>
              </div>
            </div>
            <div className="flex gap-2">
              {/* Desktop buttons */}
              <div className="hidden md:flex gap-2">
                <button onClick={() => setShowInfoModal(true)} type="button" className="bg-blue-500 text-white px-3 py-2 rounded-lg font-medium text-sm flex items-center gap-1 hover:bg-blue-600 transition-colors">
                  <Info className="w-4 h-4" />
                </button>
                <button onClick={() => {
                  const newSoundState = !isSoundEnabled;
                  setIsSoundEnabled(newSoundState);
                  trackSoundToggle(newSoundState);
                }} type="button" className="bg-green-500 text-white px-3 py-2 rounded-lg font-medium text-sm flex items-center gap-1 hover:bg-green-600 transition-colors">
                  {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                <button onClick={resetQuiz} type="button" className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-red-600 transition-colors">
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              </div>
              
              {/* Mobile hamburger menu */}
              <button onClick={() => setShowMenu(true)} type="button" className="md:hidden text-black hover:text-gray-600 transition-colors">
                <Menu className="w-8 h-8" />
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center text-lg text-gray-600">
            <span>Correct: {score}/{TARGET_CORRECT_ANSWERS}</span>
            <span>Attempts: {totalAttempts}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${(score / TARGET_CORRECT_ANSWERS) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="mb-4">
          <div className="bg-gray-50 rounded-lg p-6 mb-4">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">Cryptic clue</p>
            <p className="text-2xl md:text-3xl font-bold text-gray-800 mb-0 leading-tight">"{currentQ?.question}"</p>
            {(currentQ?.series || currentQ?.rockbusters || currentQ?.date) && (
              <p className="text-xs text-gray-400 mt-3 font-normal leading-relaxed">
                {currentQ.series && <span>{currentQ.series}</span>}
                {currentQ.rockbusters && <span> • Rockbusters #{currentQ.rockbusters}</span>}
                {currentQ.date && <span> • {currentQ.date}</span>}
              </p>
            )}
          </div>
        </div>

        {/* Merged Answer Input */}
        <div className="mb-8 text-center">
          <div className="text-lg font-semibold text-gray-700 mb-4">
            Your Answer <b>(Initials: {currentQ?.initials}):</b>
          </div>
          <div 
            className="inline-block mb-2 mx-auto transition-all duration-200 cursor-text hover:border-gray-400 relative"
            tabIndex={0}
            role="button"
            onClick={() => {
              if (inputRef.current) {
                inputRef.current.focus();
                
                // On mobile, scroll into view after keyboard appears
                if (window.innerWidth <= 768) {
                  const delay = /iPhone|iPad|iPod/i.test(navigator.userAgent) ? 300 : 150;
                  setTimeout(() => {
                    inputRef.current?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'center',
                      inline: 'nearest'
                    });
                  }, delay);
                }
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                if (inputRef.current) {
                  inputRef.current.focus();
                  
                  // On mobile, scroll into view after keyboard appears
                  if (window.innerWidth <= 768) {
                    const delay = /iPhone|iPad|iPod/i.test(navigator.userAgent) ? 300 : 150;
                    setTimeout(() => {
                      inputRef.current?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                        inline: 'nearest'
                      });
                    }, delay);
                  }
                }
                e.preventDefault();
              }
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder=""
              autoComplete="off"
              className="absolute top-0 left-0 w-full h-full opacity-0 bg-transparent border-none outline-none text-4xl p-0 m-0 z-10"
              autoFocus
            />
            <div className="text-4xl font-mono tracking-wider min-h-16 flex flex-wrap items-center justify-center leading-tight relative pointer-events-none answer-input-mobile">
              {renderMergedInput()}
            </div>
          </div>

          {isCurrentAnswerCorrect && !revealedAnswer && (
            <div className="mt-6 p-5 bg-green-50 border-2 border-green-200 rounded-2xl text-green-700 font-semibold text-xl flex items-center justify-center gap-3 animate-pulse">
              ✅ Correct! Well done!
            </div>
          )}
          {revealedAnswer && currentQ?.sound && (
            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-700">
              <p className="text-lg"><strong>Karls pronounciation:</strong> <em>{currentQ.sound}</em></p>
            </div>
          )}
        </div>

        {/* Controls */}
        {/* Mobile: skip/reveal top row, next on second row. Desktop: all in one row */}
        <div className="flex flex-col gap-2 md:flex-row md:justify-center md:items-center md:gap-4">
          <div className="flex md:justify-center items-center gap-4 md:gap-4">
            <button
              onClick={skipQuestion}
              type="button"
              disabled={revealedAnswer}
              className="w-full md:w-auto px-8 py-3 bg-orange-500 text-white rounded-lg transition-colors font-medium cursor-pointer hover:bg-orange-600 disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed"
            >
              Skip
            </button>
            <button
              onClick={revealAnswer}
              type="button"
              disabled={revealedAnswer}
              className="w-full md:w-auto px-8 py-3 bg-yellow-500 text-white rounded-lg transition-colors font-medium cursor-pointer hover:bg-yellow-600 disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed"
            >
              Reveal
            </button>
            {/* On desktop, next button is here */}
            <button
              onClick={nextQuestion}
              type="button"
              disabled={!isCurrentAnswerCorrect && !revealedAnswer}
              className="hidden md:flex items-center gap-0 px-7 py-3 bg-indigo-600 text-white rounded-lg transition-colors font-medium cursor-pointer hover:bg-indigo-700 disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed"
            >
              {currentQuestion === questions.length - 1 ? 'Finish' : 'Next'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          {/* On mobile, next button is on its own row */}
          <div className="flex justify-center items-center md:hidden">
            <button
              onClick={nextQuestion}
              type="button"
              disabled={!isCurrentAnswerCorrect && !revealedAnswer}
              className="flex items-center gap-0 px-7 py-3 bg-indigo-600 text-white rounded-lg transition-colors font-medium cursor-pointer hover:bg-indigo-700 disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed w-full text-center justify-center"
            >
              {currentQuestion === questions.length - 1 ? 'Finish' : 'Next'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      )}
      </div>
    </>
  );
};

export default RockbustersQuiz;