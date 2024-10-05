/*PLEASE DO NOT EDIT THIS CODE*/
/*This code was generated using the UMPLE 1.34.0.7242.6b8819789 modeling language!*/

package ca.mcgill.ecse.gameshop.model;
import java.util.*;
import java.sql.Date;

// line 29 "../../../../../../GameShop.ump"
public class StaffAccount extends Account
{

  //------------------------
  // MEMBER VARIABLES
  //------------------------

  //StaffAccount Associations
  private List<RequestNote> writtenNotes;

  //------------------------
  // CONSTRUCTOR
  //------------------------

  public StaffAccount(String aEmail, String aPassword)
  {
    super(aEmail, aPassword);
    writtenNotes = new ArrayList<RequestNote>();
  }

  //------------------------
  // INTERFACE
  //------------------------
  /* Code from template association_GetMany */
  public RequestNote getWrittenNote(int index)
  {
    RequestNote aWrittenNote = writtenNotes.get(index);
    return aWrittenNote;
  }

  public List<RequestNote> getWrittenNotes()
  {
    List<RequestNote> newWrittenNotes = Collections.unmodifiableList(writtenNotes);
    return newWrittenNotes;
  }

  public int numberOfWrittenNotes()
  {
    int number = writtenNotes.size();
    return number;
  }

  public boolean hasWrittenNotes()
  {
    boolean has = writtenNotes.size() > 0;
    return has;
  }

  public int indexOfWrittenNote(RequestNote aWrittenNote)
  {
    int index = writtenNotes.indexOf(aWrittenNote);
    return index;
  }
  /* Code from template association_IsNumberOfValidMethod */
  public boolean isNumberOfWrittenNotesValid()
  {
    boolean isValid = numberOfWrittenNotes() >= minimumNumberOfWrittenNotes();
    return isValid;
  }
  /* Code from template association_MinimumNumberOfMethod */
  public static int minimumNumberOfWrittenNotes()
  {
    return 1;
  }
  /* Code from template association_AddMandatoryManyToOne */
  public RequestNote addWrittenNote(String aContent, Date aDate, GameRequest aGameRequest)
  {
    RequestNote aNewWrittenNote = new RequestNote(aContent, aDate, aGameRequest, this);
    return aNewWrittenNote;
  }

  public boolean addWrittenNote(RequestNote aWrittenNote)
  {
    boolean wasAdded = false;
    if (writtenNotes.contains(aWrittenNote)) { return false; }
    StaffAccount existingNotesWriter = aWrittenNote.getNotesWriter();
    boolean isNewNotesWriter = existingNotesWriter != null && !this.equals(existingNotesWriter);

    if (isNewNotesWriter && existingNotesWriter.numberOfWrittenNotes() <= minimumNumberOfWrittenNotes())
    {
      return wasAdded;
    }
    if (isNewNotesWriter)
    {
      aWrittenNote.setNotesWriter(this);
    }
    else
    {
      writtenNotes.add(aWrittenNote);
    }
    wasAdded = true;
    return wasAdded;
  }

  public boolean removeWrittenNote(RequestNote aWrittenNote)
  {
    boolean wasRemoved = false;
    //Unable to remove aWrittenNote, as it must always have a notesWriter
    if (this.equals(aWrittenNote.getNotesWriter()))
    {
      return wasRemoved;
    }

    //notesWriter already at minimum (1)
    if (numberOfWrittenNotes() <= minimumNumberOfWrittenNotes())
    {
      return wasRemoved;
    }

    writtenNotes.remove(aWrittenNote);
    wasRemoved = true;
    return wasRemoved;
  }
  /* Code from template association_AddIndexControlFunctions */
  public boolean addWrittenNoteAt(RequestNote aWrittenNote, int index)
  {  
    boolean wasAdded = false;
    if(addWrittenNote(aWrittenNote))
    {
      if(index < 0 ) { index = 0; }
      if(index > numberOfWrittenNotes()) { index = numberOfWrittenNotes() - 1; }
      writtenNotes.remove(aWrittenNote);
      writtenNotes.add(index, aWrittenNote);
      wasAdded = true;
    }
    return wasAdded;
  }

  public boolean addOrMoveWrittenNoteAt(RequestNote aWrittenNote, int index)
  {
    boolean wasAdded = false;
    if(writtenNotes.contains(aWrittenNote))
    {
      if(index < 0 ) { index = 0; }
      if(index > numberOfWrittenNotes()) { index = numberOfWrittenNotes() - 1; }
      writtenNotes.remove(aWrittenNote);
      writtenNotes.add(index, aWrittenNote);
      wasAdded = true;
    } 
    else 
    {
      wasAdded = addWrittenNoteAt(aWrittenNote, index);
    }
    return wasAdded;
  }

  public void delete()
  {
    for(int i=writtenNotes.size(); i > 0; i--)
    {
      RequestNote aWrittenNote = writtenNotes.get(i - 1);
      aWrittenNote.delete();
    }
    super.delete();
  }

}