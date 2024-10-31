import {useEditor, EditorContent, EditorProvider, FloatingMenu, BubbleMenu} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextEditorMenuBar from "./TextEditorMenuBar";
import React from "react";
import MenuBar from "@/components/MenuBar";
import {TextAlign} from "@tiptap/extension-text-align";
import './styles.scss'

import { Color } from '@tiptap/extension-color'
import ListItem from '@tiptap/extension-list-item'
import TextStyle from '@tiptap/extension-text-style'
import Blockquote from '@tiptap/extension-blockquote'

type TextEditorProps = {
    initialContent?: string;
};

export default function TipTapEditor({
    initialContent,
}: TextEditorProps) {
    const extensions = [
        Color.configure({ types: [TextStyle.name, ListItem.name] }),
        StarterKit.configure({
            bulletList: {
                keepMarks: true,
            },
            orderedList: {
                keepMarks: true,
                keepAttributes: false,
            },
        }), 
        Underline,
        Blockquote
    ];
    
    const editor = useEditor({
        extensions: extensions,
        content: '<h2>🌍🔋 Revolutionizing EV Integration: A New Era for Power Networks!</h2>\n' +
            '<p>The surge in electric vehicle (EV) adoption is reshaping our power networks, presenting both opportunities and challenges. A recent study introduces an innovative integrated hosting capacity model designed to accommodate higher EV penetration while maintaining environmental standards. 🚗💡</p>\n' +
            '\n' +
            '<h3>Key Insights:</h3>\n' +
            '<ul>\n' +
            '  <li><strong>Multi-Objective Model:</strong> This model aims to maximize EV charging station deployment, minimize greenhouse gas emissions, and optimize net present value.</li>\n' +
            '  <li><strong>Advanced Forecasting:</strong> Utilizing a swarm intelligence forecasting algorithm, the model accurately predicts EV demand, ensuring grid reliability.</li>\n' +
            '  <li><strong>Hybrid Optimization:</strong> A novel hybrid algorithm combining the Marine Predators and Honey Badger Algorithms enhances solution accuracy and robustness.</li>\n' +
            '</ul>\n' +
            '\n' +
            '<h3>Why It Matters:</h3>\n' +
            '<p>As EV adoption accelerates, understanding and enhancing hosting capacity is crucial for grid stability and sustainability. This model not only supports the integration of EVs but also aligns with global carbon-neutral goals.</p>\n' +
            '\n' +
            '<p>🔍 Dive deeper into the strategies and technologies driving this transformation. How is your organization preparing for the EV revolution?</p>\n' +
            '\n' +
            '<p>#ESGLeadership #SustainableBusiness #GreenInnovation #ResponsibleInvesting</p>\n' +
            '\n' +
            '<p>📊 Discover the full analysis here: <a href="Link to Article">Link to Article</a></p>\n' +
            '\n' +
            '<hr />\n' +
            '\n' +
            '<h2>How do we navigate the evolving landscape of ESG reporting and compliance while ensuring transparency and avoiding greenwashing?</h2>\n' +
            '<p>This question is at the heart of the recent <a href="https://www.msci.com/www/research-report/funds-and-the-european/05050571835">MSCI report</a> on European sustainability funds, which reveals that sustainability-related funds now account for a staggering €8 trillion out of €14 trillion in European fund assets. This growth is primarily driven by equity and bond funds, with global equity strategies being particularly popular among SFDR Article 8 and 9 funds.</p>\n' +
            '\n' +
            '<blockquote>“More than twice as many European-domiciled funds have over 5% taxonomy-aligned capital expenditure compared to aligned revenues,” the report notes, highlighting a significant shift towards sustainable investments. This trend is particularly evident in the utilities sector, where over 60% of investment activity is already taxonomy-aligned, driven by renewable energy initiatives.</blockquote>\n' +
            '\n' +
            '<p>The report also underscores the importance of improved disclosures, with 80% of funds now considering Principal Adverse Impact (PAI) indicators in their strategies, up from 50% in 2023. This shift suggests that future changes to PAIs in SFDR updates could significantly impact how EU-based funds align with investor sustainability preferences.</p>\n' +
            '\n' +
            '<p>Regulatory evolution is another critical theme. The European Securities and Markets Authority (ESMA) has introduced new fund-naming guidance to enhance transparency and tackle greenwashing concerns. This includes exclusions for Article 9 funds with high fossil fuel exposure that use “green bonds” in their names.</p>\n' +
            '\n' +
            '<p>Looking ahead, fund managers must navigate these evolving regulations while aligning with investor preferences and sustainability-led portfolio construction. The ongoing European Commission review of the SFDR could take two to three years before implementation, offering a window for fund managers to better align with these evolving standards.</p>\n' +
            '\n' +
            '<p>For those interested in the intricate details of these developments, the full <a href="https://esgnews.com/european-sustainability-funds-surge-to-e8-trillion-under-sfdr-article-8-and-9-rules-msci-report/">MSCI report</a> offers a comprehensive analysis.</p>\n' +
            '\n' +
            '<hr />\n' +
            '\n' +
            '<h2>Eco-Innovation Reduces Wine Industry\'s Carbon Footprint by 25-30%</h2>\n' +
            '<p>The wine industry is tackling sustainability challenges by adopting eco-innovations like constructed wetlands and Phycosol, which significantly lower carbon emissions per bottle and align with multiple UN Sustainable Development Goals (SDGs).</p>\n' +
            '\n' +
            '<ul>\n' +
            '  <li>Conventional farming methods in wineries produce a carbon footprint of 0.06–3.0 kg CO₂-eq per 750 mL bottle, higher than mixed and organic farming.</li>\n' +
            '  <li>Eco-innovations can reduce CO₂ emissions by 25-30% per bottle, supporting SDG 9 (Industry, Innovation, and Infrastructure) and synergizing with SDGs 6 (Clean Water and Sanitation) and 12 (Responsible Consumption and Production).</li>\n' +
            '  <li>The integration of eco-innovative models like Phycosol and constructed wetlands not only reduces emissions but also transforms waste into valuable resources, such as biofertilizers and biogas.</li>\n' +
            '</ul>\n' +
            '\n' +
            '<blockquote>“Adopting eco-innovations under SDG 9 supports SDG 6 and SDG 12, ensuring the sustainability of wine production.”</blockquote>\n' +
            '\n' +
            '<p><a href="https://www.nature.com/articles/s43247-024-01766-0">Read the full article</a></p>',
        autofocus: true,
        injectCSS: false,
        editorProps: {
            attributes: {
                class: 'tiptap-editor'
            }
        },
        immediatelyRender: false
    })

    return (
        <div>
            <TextEditorMenuBar editor={editor}/>
            <EditorContent editor={editor} />
        </div>
    )
}
