(function (wp) {
    var el = wp.element.createElement;
    var __ = wp.i18n.__;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var registerBlockType = wp.blocks.registerBlockType;

    var tools = [
        { id: 'compress', label: 'Compress PDF' },
        { id: 'merge', label: 'Merge PDF' },
        { id: 'split', label: 'Split PDF' },
        { id: 'image-to-pdf', label: 'Image to PDF' },
        { id: 'edit-pdf', label: 'Edit PDF' },
        { id: 'unlock', label: 'Unlock PDF' },
        { id: 'protect', label: 'Protect PDF' },
        { id: 'rotate', label: 'Rotate PDF' },
        { id: 'delete-pages', label: 'Delete Pages' },
        { id: 'organize', label: 'Organize Pages' },
        { id: 'sign', label: 'Sign PDF' },
        { id: 'fill-form', label: 'Fill Form' },
        { id: 'ocr-pdf', label: 'OCR PDF' },
        { id: 'extract-text', label: 'Extract Text' },
        { id: 'pdf-to-word', label: 'PDF to Word' },
        { id: 'word-to-pdf', label: 'Word to PDF' },
        { id: 'repair-pdf', label: 'Repair PDF' },
        { id: 'watermark', label: 'Add Watermark' },
        { id: 'add-page-numbers', label: 'Add Page Numbers' },
        { id: 'annotate', label: 'Annotate PDF' },
        { id: 'flatten-pdf', label: 'Flatten PDF' },
        { id: 'reverse-pdf', label: 'Reverse Pages' },
        { id: 'resize', label: 'Resize PDF' },
        { id: 'crop', label: 'Crop PDF' },
        { id: 'html-to-pdf', label: 'HTML to PDF' },
        { id: 'text-to-pdf', label: 'Text to PDF' },
        { id: 'scan-to-pdf', label: 'Scan to PDF' },
        { id: 'batch', label: 'Batch Process' },
        { id: 'chat-pdf', label: 'Chat with PDF' },
        { id: 'metadata', label: 'Edit Metadata' },
    ];

    registerBlockType('pdf-tools/embed', {
        title: __('PDF Tool Embed', 'pdf-tools-embed'),
        icon: 'media-document',
        category: 'embed',
        attributes: {
            tool: { type: 'string', default: 'compress' },
            theme: { type: 'string', default: 'light' },
            height: { type: 'string', default: '' },
        },
        edit: function (props) {
            var attributes = props.attributes;
            var setAttributes = props.setAttributes;

            return el('div', { className: 'pdf-tools-embed-block' },
                el(SelectControl, {
                    label: __('Select PDF Tool', 'pdf-tools-embed'),
                    value: attributes.tool,
                    options: tools.map(function (t) { return { label: t.label, value: t.id }; }),
                    onChange: function (val) { setAttributes({ tool: val }); },
                }),
                el(SelectControl, {
                    label: __('Theme', 'pdf-tools-embed'),
                    value: attributes.theme,
                    options: [
                        { label: 'Light', value: 'light' },
                        { label: 'Dark', value: 'dark' },
                    ],
                    onChange: function (val) { setAttributes({ theme: val }); },
                }),
                el(TextControl, {
                    label: __('Height (optional, e.g. 600px)', 'pdf-tools-embed'),
                    value: attributes.height,
                    onChange: function (val) { setAttributes({ height: val }); },
                })
            );
        },
        save: function () {
            return null;
        },
    });
})(window.wp);
