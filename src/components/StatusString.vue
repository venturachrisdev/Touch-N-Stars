<template>

        <div v-if="isEnabled" class="flex items-center space-x-4 border border-gray-500 rounded-xl min-h-7 pl-2 pr-2 "> 
            <div class="flex items-center space-x-3 text-xs ">
                <bold class=" text-gray-400">{{Name}} </bold><p>{{Value}}</p>
            </div>
        </div>
  

  </template>
  
  <script>

  
  export default {
    props: {
      isEnabled: {
        type: Boolean,
        required: true,
      },
      Name: {
        type: String,
        default: 'Name:',
      },
      Value: {
        type: String,
        default: '1234', 
      },
    },
  };
  </script>
  
  <style scoped>

  </style>
  