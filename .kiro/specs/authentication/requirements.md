# Requirements: Authentication

Status: DRAFT v1, awaiting product review. `design.md` and `tasks.md` are not started.

## 0. How to read this document

- Acceptance criteria are numbered `R<requirement>.<n>` and use EARS form: "WHEN <condition> THEN the system SHALL <behavior>".
- `[A-n]` marks an assumption I made where your brief was silent (section 6). `[OQ-n]` marks an open question that needs your answer before design (section 7).
- Requirements avoid implementation detail. Technology and data model belong in `design.md`. Cross-feature rules (UTC, IANA timezones, privacy, RLS) live in steering and are referenced, not repeated.
- This spec owns the `profiles` data (decision D-A in the Personal Weekly Timetable spec). It must be implemented before that spec's Phase 3 (tasks 5.3 and 5.11).

---

## 1. Feature Overview, Scope and Dependencies

### 1.1 Overview
A visitor creates an account with email and password plus profile details (nickname, optional profile image, preferred timezone, optional phone number). A registered user signs in with email and password and gets a session. The account's profile is the identity other features read (nickname, image) and the source of the user's default display timezone.

### 1.2 In scope
- Sign up (email, password, nickname, optional profile image, preferred timezone, optional phone number)
- Email uniqueness check
- Password policy
- Login with email and password, session handling, logout
- Profile record created with the account, and its privacy rules

### 1.3 Out of scope
- Social or single-sign-on login (Google, Apple and so on)
- Password reset and change password [OQ-3]
- Email verification [OQ-1]
- Phone number verification (SMS codes). The number is stored, not verified [A-4]
- Editing the profile after sign-up (nickname, image, timezone, phone), and account deletion. Both go to a later Profile spec [OQ-6]
- Multi-factor authentication
- User search and friend rules (Friend Management spec)
- Native mobile apps

### 1.4 Dependencies on other features
| Feature | What it needs from Authentication |
|---|---|
| Personal Weekly Timetable | Current user id; `profiles` table; the user's preferred timezone as the initial display timezone (steering: `tech.md`, time model rules) |
| Friend Management | Nickname and profile image of other users. Email and phone are never returned [OQ-2] |
| Team Management, Shared Availability | Current user id and nickname |

---

## 2. User Stories and Acceptance Criteria

### R1. Sign up
**US-1** As a visitor, I want to create an account, so that I can keep a personal timetable and share availability.

- R1.1 WHEN a visitor opens the sign-up form THEN the system SHALL show fields for email, password, nickname, preferred timezone, profile image (marked optional) and phone number (marked optional).
- R1.2 WHEN a visitor submits the form with all required fields valid THEN the system SHALL create the account and its profile as one atomic operation. If either part fails, neither SHALL remain.
- R1.3 WHEN the account is created THEN the system SHALL sign the user in and take them to their timetable.
- R1.4 WHEN any required field is empty or invalid THEN the system SHALL NOT create an account and SHALL show an error next to each invalid field.
- R1.5 WHEN sign-up fails for any reason THEN the system SHALL keep the entered values except the password, and SHALL make the submit button usable again.
- R1.6 WHEN a submission is in progress THEN the system SHALL disable the submit button to prevent duplicate submissions.
- R1.7 WHEN the same sign-up request is retried (double click, network retry) THEN the system SHALL create at most one account.

### R2. Email
**US-2** As a visitor, I want my email to be unique in the system, so that nobody else can hold the same account.

- R2.1 WHEN an email is entered THEN the system SHALL validate its format and a maximum length of 254 characters.
- R2.2 The system SHALL treat emails as case-insensitive and ignore leading and trailing spaces. `Kim@Example.com` and `kim@example.com` are the same email.
- R2.3 WHEN a visitor leaves the email field (blur) with a valid format THEN the system SHALL check whether the email is already registered and SHALL show "already in use" next to the field if so.
- R2.4 WHEN a visitor submits sign-up with an email that is already registered THEN the system SHALL reject the submission with the same "already in use" error, even if the earlier check passed (two people can race for the same email).
- R2.5 The system SHALL enforce email uniqueness in the database, not only in the form, so that concurrent sign-ups with the same email result in exactly one account.
- R2.6 The email availability check SHALL be rate limited per client. WHEN the limit is exceeded THEN the system SHALL return a "try again later" error and SHALL NOT reveal availability [A-1].
- R2.7 WHEN the availability check itself fails (network or server error) THEN the system SHALL NOT claim the email is free or taken, and the final check at submission (R2.4) SHALL still apply.

### R3. Password
**US-3** As a visitor, I want clear password rules, so that I can choose a strong password the first time.

- R3.1 The password SHALL have at least 10 characters.
- R3.2 The password SHALL contain characters from at least 2 of these 4 types: uppercase letters, lowercase letters, numbers, symbols.
- R3.3 The password SHALL have a maximum length of 72 bytes [A-2]. WHEN it is longer THEN the system SHALL show an error and SHALL NOT silently truncate it.
- R3.4 WHEN the visitor types in the password field THEN the system SHALL show which rules are met (length, number of character types) as live feedback, using text and not color alone.
- R3.5 The password field SHALL be masked by default and SHALL offer a show/hide control that is keyboard operable.
- R3.6 The system SHALL enforce R3.1 to R3.3 on the server, not only in the form.
- R3.7 The system SHALL NOT log, display after submission, or return the password in any response. Passwords are stored only as a salted hash produced by the authentication provider.
- R3.8 The system SHALL NOT allow the password to be identical to the email [A-3].

### R4. Nickname
**US-4** As a visitor, I want a nickname, so that friends and teammates can recognize me.

- R4.1 WHEN a nickname is entered THEN the system SHALL trim spaces and require 2 to 30 characters [A-5].
- R4.2 The nickname SHALL allow letters in any language, numbers, single spaces between words, and the characters `_ - .` [A-5]. Control characters and leading, trailing or repeated spaces SHALL be rejected.
- R4.3 Nicknames SHALL NOT need to be unique [A-6]. Users are identified by id, never by nickname.
- R4.4 The system SHALL enforce R4.1 and R4.2 on the server.

### R5. Profile image (optional)
**US-5** As a visitor, I want to add a profile image, so that others can recognize me visually.

- R5.1 WHEN no image is chosen THEN the system SHALL create the account without one and SHALL show a placeholder (the nickname's initial) wherever the image would appear.
- R5.2 WHEN the visitor chooses an image THEN the system SHALL accept only JPEG, PNG or WebP files up to 5 MB [A-7], judged by file content and not only by file name.
- R5.3 WHEN the file type or size is not allowed THEN the system SHALL show an error and SHALL keep the rest of the form.
- R5.4 WHEN an image is chosen THEN the system SHALL show a preview and SHALL offer a remove action that is keyboard operable.
- R5.5 WHEN sign-up does not complete THEN the system SHALL NOT leave an orphaned uploaded image behind.
- R5.6 The image SHALL be readable by other signed-in users only through the profile contract (R9.2). It SHALL NOT be publicly listable.
- R5.7 The system SHALL provide alternative text for the image: the nickname.

### R6. Preferred timezone
**US-6** As a visitor, I want to choose my timezone, so that my timetable shows times in my local time.

- R6.1 WHEN the sign-up form opens THEN the system SHALL preselect the browser's timezone (`Intl.DateTimeFormat().resolvedOptions().timeZone`).
- R6.2 WHEN the browser reports a timezone that is not a valid IANA identifier THEN the system SHALL leave the field empty and require a choice.
- R6.3 The timezone field SHALL be searchable by city or region name and SHALL show the current UTC offset next to each option.
- R6.4 The system SHALL accept only valid IANA timezone identifiers (for example `Asia/Seoul`, `America/New_York`) and SHALL validate this on the server.
- R6.5 WHEN the account is created THEN the system SHALL store the chosen timezone as that user's preferred timezone. It becomes the initial display timezone for the timetable. Later browser detection SHALL NOT overwrite it (steering: time model rules).
- R6.6 The preferred timezone SHALL be readable only by its owner (steering: privacy rules).

### R7. Phone number (optional)
**US-7** As a visitor, I want to add my phone number with its country code, so that the service can reach me later.

- R7.1 WHEN the visitor enters a phone number THEN the system SHALL require a country calling code (for example +82) and a national number, entered in separate controls or one control that makes the country code explicit.
- R7.2 The country code selector SHALL be searchable by country name or code and SHALL default to the country that matches the preferred timezone when one exists, otherwise to none [A-8].
- R7.3 The system SHALL validate the number against the selected country's numbering rules, accept common separators (spaces, hyphens, parentheses) and a leading trunk 0, and SHALL store it in E.164 format (`+821012345678`).
- R7.4 WHEN the phone field is left empty THEN the system SHALL accept the sign-up and store no phone number.
- R7.5 WHEN a country code is chosen but the number is empty (or the reverse) THEN the system SHALL show an error on the phone field and SHALL NOT create the account.
- R7.6 Phone numbers SHALL NOT need to be unique [A-9].
- R7.7 The system SHALL NOT verify phone ownership in this spec, and SHALL NOT present the number as verified.
- R7.8 The phone number SHALL be readable only by its owner and SHALL NOT be returned by any other-user profile contract (R9.2).

### R8. Login
**US-8** As a registered user, I want to sign in with email and password, so that I can reach my timetable.

- R8.1 WHEN a visitor submits a registered email and the matching password THEN the system SHALL sign them in and take them to their timetable (or the page they tried to open, R8.9).
- R8.2 WHEN the email is unknown OR the password is wrong THEN the system SHALL show one identical message ("Email or password is incorrect") and SHALL NOT reveal which part was wrong.
- R8.3 The response time for unknown email and wrong password SHOULD NOT differ in a way that reveals which one occurred.
- R8.4 WHEN a login fails 5 times in 15 minutes for the same email or from the same client THEN the system SHALL temporarily block further attempts and show a "try again later" message [A-10].
- R8.5 The login email SHALL be matched case-insensitively and with surrounding spaces ignored (R2.2).
- R8.6 WHEN a login submission is in progress THEN the system SHALL disable the submit button.
- R8.7 WHEN the user is already signed in and opens the login or sign-up page THEN the system SHALL redirect them to their timetable.
- R8.8 WHEN the network fails during login THEN the system SHALL show a retryable error and SHALL NOT sign the user in.
- R8.9 WHEN a signed-out visitor opens a protected page THEN the system SHALL send them to login and, after success, return them to that page. The return target SHALL be a path inside the app only (no open redirect).

### R9. Session, logout and profile access
**US-9** As a signed-in user, I want to stay signed in and be able to sign out, so that I need not log in every visit and can protect my account on shared devices.

- R9.1 WHEN a user is signed in THEN the system SHALL keep the session across page reloads and browser restarts until it expires or the user signs out [OQ-4].
- R9.2 The system SHALL expose to other signed-in users only a user's id, nickname and profile image, and only through a defined contract for features that need them. Email, phone number, preferred timezone and display preferences SHALL NOT be returned.
- R9.3 WHEN a user chooses sign out THEN the system SHALL end the session on this device and take the user to login.
- R9.4 WHEN a session expires or becomes invalid while the app is open THEN the system SHALL send the user to login, SHALL keep unsaved form input where possible, and SHALL NOT show another user's data.
- R9.5 WHEN a signed-out visitor requests any user data THEN the system SHALL respond with an authentication error (HTTP 401) and return no data.
- R9.6 Every authentication-related table SHALL have row-level security enabled, and its policies SHALL have automated tests (steering: privacy rules).
- R9.7 A user SHALL be able to read and update only their own profile row.

### R10. Accessibility and layout
- R10.1 All sign-up and login controls SHALL be operable by keyboard in a logical order, each with a visible label and a visible focus state.
- R10.2 Validation errors SHALL be tied to their fields programmatically and announced to assistive technology. Errors SHALL NOT rely on color alone.
- R10.3 WHEN submission fails THEN the system SHALL move focus to the first invalid field or to the error summary.
- R10.4 The forms SHALL work on desktop and mobile widths without horizontal scrolling [F] (layout to be confirmed against the approved Figma designs).
- R10.5 The forms SHALL allow browser and password-manager autofill (correct autocomplete attributes for email, new and current password, telephone).

### R11. Non-functional
- R11.1 Sign-up and login submissions SHOULD complete within 2 seconds under normal conditions (p95).
- R11.2 Authentication secrets and keys SHALL come from environment variables with a documented `.env.example` and SHALL NOT be in the repository (steering: structure).
- R11.3 Authentication errors SHALL be mapped to HTTP codes: 400 validation, 401 not authenticated, 403 forbidden, 409 conflict (duplicate email), 429 rate limited.
