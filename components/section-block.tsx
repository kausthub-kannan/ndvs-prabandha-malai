import React from 'react';
import { Platform, Text, View } from 'react-native';

const renderFormattedContent = (content: string, justify = false) => {
  if (!content) return null;
  const parts = content.split(/(<verse>[\s\S]*?<\/verse>)/g);
  return (
    <View>
      {parts.map((part, index) => {
        if (part.startsWith('<verse>') && part.endsWith('</verse>')) {
          const verseText = part.substring(7, part.length - 8).trim();
          return (
            <Text
              key={index}
              style={{
                fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
                fontStyle: 'italic',
                lineHeight: 30,
                textAlign: 'center',
              }}
              className="text-text-muted text-[1rem] tracking-[0.01875rem] my-5"
              selectable={true}
            >
              {verseText}
            </Text>
          );
        } else {
          const trimmed = part.trim();
          if (!trimmed) return null;
          return (
            <Text
              key={index}
              style={{
                fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
                lineHeight: 30
              }}
              className={`text-text-muted text-[1rem] tracking-[0.0125rem] text-justify`}
              selectable={true}
            >
              {trimmed}
            </Text>
          );
        }
      })}
    </View>
  );
};

export function SectionBlock({ title, content }: { title: string; content: string }) {
  if (!content) return null;
  return (
    <View className="mb-[1.625rem]">
      <Text className="text-accent text-[0.6875rem] font-bold tracking-[0.0875rem] uppercase mb-2.5" selectable={true}>{title}</Text>
      {renderFormattedContent(content, true)}
    </View>
  );
}
