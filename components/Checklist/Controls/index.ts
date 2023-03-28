/*
    --- --- --- --- --- --- READ ME --- --- --- --- --- --- ---
                              >w<

    each of these controls extend from the abstract class
    CheckControl. if you want to add a control to the checklist
    moduke. you MUST extend from CheckControl.

    some methods that have to be implemented are
    + clone             - recreates and returns itself, often
                          for internal use
    + duplicate         - recreates and returns itself WITH a
                          new ID. Often will be used when the
                          user clicks on 'duplicate'
    + toString          - will be invoked when object is
                          converted to type string. wont be
                          used by the user, but may be helpful
                          for debugging. follow the format
                          '[ControlType]<[ID]>. Example:
                          'SingleChoiceControl<${this.id}>'
    + toJSON            - will be invoked when object is passed
                          into JSON.stringify(). will be used
                          when storing itself for the database.
                          HAS to include 'type', 'question',
                          'value'
                          Example:
                            {
                                "type": "SingleChoice",
                                "question": this.question,
                                "value": this.value,
                                "choices": this.choices
                            }
    + render            - returns a ReactNode for rendering.
                          
    each object (and its renderable counterpart) is responsible
    for governing itself. if a user inputs something, it should
    handle the changes, including the deletion if itself. often
    this would mean passing an onChange and a onDelete.

    lastly, a ControlFactory class contains a single fromJSON()
    method, which would be used to convert a single check from
    a parsed JSON string ( which gets converted to a generic
    Object first ) to its corresponding CheckControl object,
    which uses the 'type' field. this method should also be
    updated when adding a new control.

    for an example, FreeText.tsx is a simple, but complete
    control. you may refer to it if any difficulties arise when
    creating your own checklist control.

    good luck and have fun :3

    - jon

                              >w<
    --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
*/

export * from "./SingleChoice"
export * from "./MultiChoice"
export * from "./FreeText"
export * from "./FileUpload"
export * from "./Signature"