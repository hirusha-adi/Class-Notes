import PocketBase from "pocketbase";

const url = "https://db.class.hirusha.xyz";

export const pb = new PocketBase(url);

// in development mode
// NOTE, CRITICAL
// uncomment on production
pb.autoCancellation(false);

export const isUserLoggedIn = pb.authStore.isValid;
export const user = pb.authStore;
export const isTeacher = user.record?.isTeacher;

export async function login(username, password) {
  await pb.collection("class_notes_users").authWithPassword(username, password);
  if (isTeacher) {
    window.location.reload();
  } else {
    window.location.href = "/";
  }
}

export async function logout() {
  pb.authStore.clear();

  // WARNING: this will break if there is a base url
  window.location.href = "/login";
  // window.location.reload();
}

export async function getSubject(subject) {
  if (!subject) {
    return null;
  }
  return await pb
    .collection("class_notes_subjects")
    .getFirstListItem(`subject="${subject}"`);
}

export async function getNoteByResourceName(resourceName) {
  return await pb
    .collection("class_notes_notes")
    .getFirstListItem(`resourceName="${resourceName}"`);
}

export async function getNoteById(noteId) {
  return await pb
    .collection("class_notes_notes")
    .getFirstListItem(`id="${noteId}"`);
}

export async function getNotesIdAndResourceNames() {
  return await pb.collection("class_notes_notes").getFullList({
    fields: `id,resourceName`,
  });
}

export async function deleteNote(noteId) {
  return await pb.collection("class_notes_notes").delete(noteId);
}

export async function updateNote(noteId, newResourceName, newUrl, newNote) {
  return await pb.collection("class_notes_notes").update(noteId, {
    resourceName: newResourceName,
    url: newUrl,
    note: newNote,
  });
}

export async function createNote(resourceName, url, note) {
  return await pb.collection("class_notes_notes").create({
    resourceName: resourceName,
    url: url,
    note: note,
  });
}

export async function getUsersPaginated(
  pageNo,
  itemsPerPage,
  isTeacher,
  tblFilterName = "created",
  tblFilterOrder = "asc"
) {
  // console.log({ pageNo, itemsPerPage, isTeacher });
  return await pb
    .collection("class_notes_users")
    .getList(pageNo, itemsPerPage, {
      filter: `isTeacher=${String(isTeacher)}`,
      sort: `${tblFilterOrder === "asc" ? "+" : "-"}${tblFilterName}`,
    });
}

export async function getUser(userId) {
  return await pb
    .collection("class_notes_users")
    .getFirstListItem(`id="${userId}"`);
}

export async function getUserByEmail(email) {
  if (!email) {
    return null;
  }
  return await pb
    .collection("class_notes_users")
    .getFirstListItem(`email="${email}"`);
}

export async function getUserByPhone(phone) {
  if (!phone) {
    return null;
  }
  return await pb
    .collection("class_notes_users")
    .getFirstListItem(`phone="${phone}"`);
}

export async function deleteUser(userId) {
  return await pb.collection("class_notes_users").delete(userId);
}

export async function updateUser(
  userId,
  newName,
  newEmail,
  newAge,
  newSubject,
  newExamSeries,
  newVerified,
  newIsTeacher
) {
  return await pb.collection("class_notes_users").update(userId, {
    name: newName,
    email: newEmail,
    age: newAge,
    subject: newSubject,
    examSeries: newExamSeries,
    verified: newVerified,
    isTeacher: newIsTeacher,
  });
}

export async function createUser(
  name,
  email,
  password,
  age,
  subject,
  examSeries,
  verified,
  isTeacher
) {
  // create a username from the name
  const parts = name.trim().split(/\s+/);
  let username;
  if (parts.length === 1) {
    username = parts[0];
  } else if (parts.length >= 2) {
    username = `${parts[0].toLowerCase()}.${parts[1]
      .slice(0, 3)
      .toLowerCase()}`;
  }

  return await pb.collection("class_notes_users").create({
    username: username,
    email: email,
    emailVisibility: true,
    password: password,
    passwordConfirm: password,
    name: name,
    age: age,
    subject: subject,
    examSeries: examSeries,
    verified: verified,
    isTeacher: isTeacher,
  });
}

export async function getSubjectsAll() {
  return await pb.collection("class_notes_subjects").getFullList();
}

export async function getNotesPaginated(
  pageNo,
  itemsPerPage,
  tblFilterName = "created",
  tblFilterOrder = "asc",
  tblFilterSubjectName = "all",
  tblFilterSubjectType = "all"
) {
  let strFilter = "";
  if (tblFilterSubjectName !== "all" || tblFilterSubjectType !== "all") {
    strFilter += `resourceName~"`;
  }

  if (tblFilterSubjectName === "all" && tblFilterSubjectType !== "all") {
    strFilter += `_${tblFilterSubjectType}_`;
  } else {
    if (tblFilterSubjectName !== "all") {
      strFilter += `${tblFilterSubjectName}_`;
    }
    if (tblFilterSubjectType !== "all") {
      strFilter += `${tblFilterSubjectType}_`;
    }
  }

  if (tblFilterSubjectName !== "all" || tblFilterSubjectType !== "all") {
    strFilter += `"`;
  }

  console.log(strFilter);

  const queryOptions = {
    sort: `${tblFilterOrder === "asc" ? "+" : "-"}${tblFilterName}`,
  };

  if (tblFilterSubjectName !== "all" || tblFilterSubjectType !== "all") {
    queryOptions.filter = strFilter;
  }

  return await pb
    .collection("class_notes_notes")
    .getList(pageNo, itemsPerPage, queryOptions);
}

/* 
Pocketbase Schema:
------------------

class_notes_users (auth)
  feilds
    auto
      id
      created
      updated
      uername
      email
      emailVisibility
      verified
    custom
      name (text)
      age (number)
      subject (text)
      examSeries (text)
      isTeacher (boolean)

class_notes_subjects (base)
  feilds
    auto
      id
      created
      updated
    custom
      subject (text)
      name (text)
      code (text)
      host (text)

class_notes_notes (base)
  feilds
    auto
      id
      created
      updated
    custom
      resourceName (text)
      url (text)
      note (text)
  rules
    List/Search rule
      @request.auth.id = @collection.class_notes_accesss.userId
    View rule
      @request.auth.id != ""

class_notes_accesss (base)
  feilds
    auto
      id
      created
      updated
    custom
      userId (text)
      resourceName (text)
  rules
    List/Serch rule
      @request.auth.id != "" && @request.auth.id = userId
    View rule
      @request.auth.id != "" && @request.auth.id = userId
    All
      @request.auth.id != "" && @request.auth.isTeacher = true
*/
