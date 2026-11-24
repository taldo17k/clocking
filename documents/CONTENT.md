# Content of the Hand-Made Example

Source: `documents/24hr-clock-example.jpeg`, a hand-drawn page in Hebrew. Only the drawing on the page is used; the marks in the margins are ignored.

## Title

> **הסבר על הזמן ביממה ואיך לקרוא שעון**
> *"An explanation of the time in a day, and how to read a clock"*

## Section 1: The hour pairs table (center of the page)

The page pairs each 24-hour value with the hour that is 12 hours later:

| Hours 00–11 | | Hours 12–23 |
|---|---|---|
| 00 | = | 12 |
| 01 | = | 13 |
| 02 | = | 14 |
| 03 | = | 15 |
| 04 | = | 16 |
| 05 | = | 17 |
| 06 | = | 18 |
| 07 | = | 19 |
| 08 | = | 20 |
| 09 | = | 21 |
| 10 | = | 22 |
| 11 | = | 23 |

- An arrow under the table points to the word **אומרים**, *"we say"*. The two hours in a pair are **said the same way** in everyday speech. For example, 01 and 13 are both said as "one".
- A curved arrow links **00 → 12**, which points out the special case that both are said as "twelve".
- The hidden rule: **right column = left column + 12**.

## Section 2: Parts of the day (the drawings around the table)

Brackets group the rows, and each group points to a drawn sky scene:

| Hours | Part of day (Hebrew → English) | Drawing |
|---|---|---|
| 00–05 | לילה → **Night** | Black sky, yellow crescent moon, stars |
| 06 | (picture only) → **Sunrise** | Sun rising over pink hills, purple sky |
| 07–11 | בוקר → **Morning** | Yellow sun, light-blue sky |
| 12–14 | צהריים → **Midday** | Big bright sun, blue sky |
| 15–17 | אחר הצהריים → **Afternoon** | Smaller sun, blue sky |
| 18 | (picture only) → **Sunset** | Orange and purple striped sunset |
| 19–21 | ערב → **Evening** | Dark sky, moon, stars |
| 22–23 | לילה → **Night** | Dark sky, moon, stars |

The left side of the page covers the 00–11 column, and the right side covers the 12–23 column. Read top to bottom, the pictures go through a full day: night → sunrise → morning → midday → afternoon → sunset → evening → night.

*Confirmed choices for the English version:*
- Hours 06 and 18 have a picture but no word on the page. They are labeled "Sunrise" and "Sunset".
- The page groups 12–15 as צהריים. For English, 12–14 is **Midday** and 15–17 is **Afternoon**, because "three o'clock in the afternoon" is the natural English phrasing.

## Section 3: Structure of the clock

> **מבנה השעון**, *"The structure of the clock"*

```
 _ _ : _ _
 hours   minutes
(00–23)  (00–59)
```

The digital time has two parts: **hours** from 00 to 23 before the colon, and **minutes** from 00 to 59 after it.

## Section 4: Worked examples

**Example 1:** `08:15`
> השעה שמונה וחמש עשרה דקות בבוקר
> *"The time is eight and fifteen minutes in the morning."*

**Example 2:** `22:39`
> השעה עשר ושלושים ותשע דקות בלילה
> *"The time is ten and thirty-nine minutes at night."*

Example 2 shows the method in full. To read **22**, find its pair (**10**), say "ten", and then add the part of the day ("at night").

## The method the page teaches

1. Split the time into **hours : minutes**.
2. If the hour is 12 or more, find its pair in the table (subtract 12). 00 is said as "twelve".
3. Say: *"[spoken hour] and [minutes] minutes"*.
4. Add the **part of the day** that matches the 24-hour value (morning, at night, and so on).

## Notes for the English version

- The original does **not** use AM/PM. It uses part-of-day words instead. The English site will keep that approach as the main method, and will show AM/PM as a secondary hint, since English speakers will expect it.
- Natural English phrasing: "It's eight fifteen in the morning" and "It's ten thirty-nine at night". The more literal "eight and fifteen minutes" can be shown as a step toward it. (A "quarter past / ten to" style was tried and rejected: simply saying the minutes is clearer.)

## Notes for the Hebrew version (`/clocking/he/`)

- The sentences follow the page: "השעה שמונה וחמש עשרה דקות בבוקר" and "השעה עשר ושלושים ותשע דקות בלילה". Whole hours are said without minutes ("השעה שמונה בבוקר"), one minute is "ודקה אחת" and two minutes are "ושתי דקות". Hours and minutes use feminine numbers.
- Parts of the day: לילה, זריחה (06), בוקר, צהריים (12–14, the same split as English), אחר הצהריים, שקיעה (18), ערב. In sentences: בלילה, בבוקר, בצהריים, אחר הצהריים, בערב.
- There is no AM/PM hint. The digital clock and the hour pairs board keep the drawing's left-to-right layout.
